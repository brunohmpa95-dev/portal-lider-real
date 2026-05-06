-- 1) Adiciona campos opcionais para clientes "stub" (sem auth)
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS source_lead_id uuid REFERENCES public.property_leads(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_to uuid;

-- Permite cliente sem profile (lead convertido sem login)
ALTER TABLE public.clients ALTER COLUMN profile_id DROP NOT NULL;

-- 2) Índices únicos parciais para dedupe
CREATE UNIQUE INDEX IF NOT EXISTS clients_email_unique
  ON public.clients (lower(email)) WHERE email IS NOT NULL AND email <> '';
CREATE UNIQUE INDEX IF NOT EXISTS clients_phone_unique
  ON public.clients (regexp_replace(phone, '\D', '', 'g'))
  WHERE phone IS NOT NULL AND phone <> '';
CREATE UNIQUE INDEX IF NOT EXISTS clients_cpf_unique
  ON public.clients (regexp_replace(cpf_cnpj, '\D', '', 'g'))
  WHERE cpf_cnpj IS NOT NULL AND cpf_cnpj <> '';

-- 3) Helper: encontrar cliente existente por email/telefone/cpf
CREATE OR REPLACE FUNCTION public.find_existing_client(
  _email text DEFAULT NULL,
  _phone text DEFAULT NULL,
  _cpf text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _id uuid;
  _email_n text := NULLIF(lower(trim(_email)), '');
  _phone_n text := NULLIF(regexp_replace(COALESCE(_phone,''), '\D', '', 'g'), '');
  _cpf_n   text := NULLIF(regexp_replace(COALESCE(_cpf,''), '\D', '', 'g'), '');
BEGIN
  IF _cpf_n IS NOT NULL THEN
    SELECT id INTO _id FROM public.clients
     WHERE regexp_replace(COALESCE(cpf_cnpj,''), '\D', '', 'g') = _cpf_n LIMIT 1;
    IF _id IS NOT NULL THEN RETURN _id; END IF;
  END IF;

  IF _email_n IS NOT NULL AND _email_n NOT LIKE 'wa+%@anon.lider.local' THEN
    SELECT id INTO _id FROM public.clients
     WHERE lower(email) = _email_n LIMIT 1;
    IF _id IS NOT NULL THEN RETURN _id; END IF;

    -- também checa via profile vinculado
    SELECT c.id INTO _id FROM public.clients c
      JOIN public.profiles p ON p.id = c.profile_id
      JOIN auth.users u ON u.id = p.user_id
     WHERE lower(u.email) = _email_n LIMIT 1;
    IF _id IS NOT NULL THEN RETURN _id; END IF;
  END IF;

  IF _phone_n IS NOT NULL AND length(_phone_n) >= 8 THEN
    SELECT id INTO _id FROM public.clients
     WHERE regexp_replace(COALESCE(phone,''), '\D', '', 'g') = _phone_n LIMIT 1;
    IF _id IS NOT NULL THEN RETURN _id; END IF;

    SELECT c.id INTO _id FROM public.clients c
      JOIN public.profiles p ON p.id = c.profile_id
     WHERE regexp_replace(COALESCE(p.phone,''), '\D', '', 'g') = _phone_n LIMIT 1;
    IF _id IS NOT NULL THEN RETURN _id; END IF;
  END IF;

  RETURN NULL;
END;
$$;

-- 4) Conversão de lead em cliente
CREATE OR REPLACE FUNCTION public.convert_lead_to_client(_lead_id uuid)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _lead public.property_leads;
  _client_id uuid;
  _is_new boolean := false;
BEGIN
  SELECT * INTO _lead FROM public.property_leads WHERE id = _lead_id;
  IF _lead IS NULL THEN RAISE EXCEPTION 'Lead não encontrado'; END IF;

  IF _lead.client_id IS NOT NULL THEN
    RETURN _lead.client_id;
  END IF;

  -- tenta achar cliente existente
  _client_id := public.find_existing_client(_lead.email, COALESCE(_lead.whatsapp, _lead.phone), NULL);

  IF _client_id IS NULL THEN
    INSERT INTO public.clients(full_name, email, phone, source_lead_id, assigned_to, notes)
    VALUES (
      _lead.name,
      CASE WHEN _lead.email LIKE 'wa+%@anon.lider.local' THEN NULL ELSE _lead.email END,
      COALESCE(_lead.whatsapp, _lead.phone),
      _lead.id,
      _lead.assigned_to,
      'Cliente criado a partir do lead ' || _lead.id::text
    )
    RETURNING id INTO _client_id;
    _is_new := true;
  END IF;

  UPDATE public.property_leads
     SET client_id = _client_id,
         status = 'converted',
         updated_at = now()
   WHERE id = _lead_id;

  INSERT INTO public.lead_interactions(lead_id, user_id, interaction_type, content)
  VALUES (
    _lead_id,
    COALESCE(auth.uid(), _lead.assigned_to, _lead_id),
    'note',
    CASE WHEN _is_new
      THEN 'Lead convertido em novo cliente'
      ELSE 'Lead vinculado a cliente já existente'
    END
  );

  RETURN _client_id;
END;
$$;

-- 5) Atualiza policies: permitir leitura/insert para internos sem profile
DROP POLICY IF EXISTS clients_internal_read ON public.clients;
CREATE POLICY clients_internal_read ON public.clients FOR SELECT TO authenticated
  USING (
    is_admin(auth.uid())
    OR has_role(auth.uid(), 'corretor'::app_role)
    OR has_role(auth.uid(), 'vendas'::app_role)
    OR has_role(auth.uid(), 'locacao'::app_role)
  );

DROP POLICY IF EXISTS clients_internal_insert ON public.clients;
CREATE POLICY clients_internal_insert ON public.clients FOR INSERT TO authenticated
  WITH CHECK (
    is_admin(auth.uid())
    OR has_role(auth.uid(), 'corretor'::app_role)
    OR has_role(auth.uid(), 'vendas'::app_role)
    OR has_role(auth.uid(), 'locacao'::app_role)
  );

DROP POLICY IF EXISTS clients_internal_update ON public.clients;
CREATE POLICY clients_internal_update ON public.clients FOR UPDATE TO authenticated
  USING (
    is_admin(auth.uid())
    OR has_role(auth.uid(), 'corretor'::app_role)
    OR has_role(auth.uid(), 'vendas'::app_role)
    OR has_role(auth.uid(), 'locacao'::app_role)
  );

-- 6) Index para histórico cliente -> leads
CREATE INDEX IF NOT EXISTS idx_leads_client_id ON public.property_leads(client_id);