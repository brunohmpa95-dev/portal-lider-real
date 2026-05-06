-- Tabela de configuração (singleton)
CREATE TABLE IF NOT EXISTS public.whatsapp_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active boolean NOT NULL DEFAULT true,
  phone_e164 text NOT NULL DEFAULT '5537999000000',
  display_phone text,
  default_message text NOT NULL DEFAULT 'Olá! Vim pelo site da Líder Imóveis Itaúna.',
  responsible_sector text NOT NULL DEFAULT 'vendas',
  auto_create_lead boolean NOT NULL DEFAULT true,
  provider text NOT NULL DEFAULT 'web',
  provider_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.whatsapp_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY wa_settings_authenticated_read
  ON public.whatsapp_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY wa_settings_admin_write
  ON public.whatsapp_settings FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE TRIGGER trg_wa_settings_updated_at
  BEFORE UPDATE ON public.whatsapp_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Singleton inicial
INSERT INTO public.whatsapp_settings (phone_e164, display_phone, default_message)
VALUES ('5537999000000', '(37) 99900-0000', 'Olá! Vim pelo site da Líder Imóveis Itaúna.')
ON CONFLICT DO NOTHING;

-- Tabela de cliques
CREATE TABLE IF NOT EXISTS public.whatsapp_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  intent text NOT NULL DEFAULT 'general',
  page text,
  url text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  property_id uuid,
  property_code text,
  property_title text,
  neighborhood text,
  message_sent text,
  visitor_id text,
  user_id uuid,
  lead_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_wa_clicks_occurred ON public.whatsapp_clicks(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_wa_clicks_lead ON public.whatsapp_clicks(lead_id);
CREATE INDEX IF NOT EXISTS idx_wa_clicks_property ON public.whatsapp_clicks(property_id);

ALTER TABLE public.whatsapp_clicks ENABLE ROW LEVEL SECURITY;

-- Gravação livre (visitante anônimo pode registrar clique)
CREATE POLICY wa_clicks_public_insert
  ON public.whatsapp_clicks FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Leitura apenas equipe interna
CREATE POLICY wa_clicks_internal_read
  ON public.whatsapp_clicks FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'corretor'::app_role)
    OR has_role(auth.uid(), 'vendas'::app_role)
    OR has_role(auth.uid(), 'locacao'::app_role)
    OR has_role(auth.uid(), 'financeiro'::app_role)
    OR is_admin(auth.uid())
  );

CREATE POLICY wa_clicks_admin_delete
  ON public.whatsapp_clicks FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));