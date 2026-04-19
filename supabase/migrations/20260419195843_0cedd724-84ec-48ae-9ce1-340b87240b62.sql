
-- =========================================
-- 1. Marcar bairros pendentes como verificados (todos são bairros reais de Itaúna-MG)
-- =========================================
UPDATE public.neighborhoods
SET verified = true, source = COALESCE(source, 'manual-review-2026')
WHERE name IN ('Alvorada', 'Santo Antônio', 'Vila Romana', 'Residencial Morro Verde')
  AND verified = false;

-- =========================================
-- 2. Catálogo de motivos de perda
-- =========================================
CREATE TABLE public.lead_lost_reasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_lost_reasons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lost_reasons_internal_read" ON public.lead_lost_reasons
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'corretor'::app_role)
    OR has_role(auth.uid(), 'vendas'::app_role)
    OR has_role(auth.uid(), 'locacao'::app_role)
    OR is_admin(auth.uid())
  );

CREATE POLICY "lost_reasons_admin_write" ON public.lead_lost_reasons
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

INSERT INTO public.lead_lost_reasons (name, sort_order) VALUES
  ('Preço acima do orçamento', 10),
  ('Localização não atendeu', 20),
  ('Sem retorno do cliente', 30),
  ('Escolheu concorrente', 40),
  ('Imóvel fora do perfil', 50),
  ('Crédito negado / financiamento', 60),
  ('Desistiu da compra/aluguel', 70),
  ('Outro', 999);

-- =========================================
-- 3. Ampliar property_leads com interesse + perda + follow-up
-- =========================================
ALTER TABLE public.property_leads
  ADD COLUMN IF NOT EXISTS interest_purpose text,
  ADD COLUMN IF NOT EXISTS interest_property_type text,
  ADD COLUMN IF NOT EXISTS interest_neighborhood_id uuid REFERENCES public.neighborhoods(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS interest_min_price numeric,
  ADD COLUMN IF NOT EXISTS interest_max_price numeric,
  ADD COLUMN IF NOT EXISTS interest_bedrooms integer,
  ADD COLUMN IF NOT EXISTS next_followup_at timestamptz,
  ADD COLUMN IF NOT EXISTS lost_reason_id uuid REFERENCES public.lead_lost_reasons(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS lost_notes text,
  ADD COLUMN IF NOT EXISTS lost_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_leads_followup ON public.property_leads(next_followup_at) WHERE next_followup_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_funnel_stage ON public.property_leads(funnel_stage);

-- =========================================
-- 4. Trigger: enforce lost_reason quando funnel_stage = 'lost'
-- =========================================
CREATE OR REPLACE FUNCTION public.validate_lead_lost()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Apenas quando virando "lost" agora
  IF NEW.funnel_stage = 'lost' AND (OLD.funnel_stage IS DISTINCT FROM 'lost') THEN
    IF NEW.lost_reason_id IS NULL THEN
      RAISE EXCEPTION 'Motivo da perda obrigatório ao marcar lead como perdido'
        USING ERRCODE = 'check_violation';
    END IF;
    NEW.lost_at := COALESCE(NEW.lost_at, now());
  END IF;

  -- Se mover para fora de "lost", limpar lost_at
  IF NEW.funnel_stage <> 'lost' AND OLD.funnel_stage = 'lost' THEN
    NEW.lost_at := NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_lead_lost ON public.property_leads;
CREATE TRIGGER trg_validate_lead_lost
  BEFORE UPDATE ON public.property_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_lead_lost();

-- =========================================
-- 5. Tabela tasks
-- =========================================
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  due_at timestamptz,
  status text NOT NULL DEFAULT 'pending', -- pending | done | cancelled
  priority text NOT NULL DEFAULT 'normal', -- low | normal | high | urgent
  assigned_to uuid,
  created_by uuid,
  lead_id uuid REFERENCES public.property_leads(id) ON DELETE CASCADE,
  client_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  contract_id uuid REFERENCES public.contracts(id) ON DELETE SET NULL,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tasks_assigned ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_due ON public.tasks(due_at) WHERE status = 'pending';
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_lead ON public.tasks(lead_id);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks_admin_all" ON public.tasks
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "tasks_internal_read" ON public.tasks
  FOR SELECT TO authenticated
  USING (
    assigned_to = auth.uid()
    OR created_by = auth.uid()
    OR (
      (has_role(auth.uid(), 'corretor'::app_role)
       OR has_role(auth.uid(), 'vendas'::app_role)
       OR has_role(auth.uid(), 'locacao'::app_role))
    )
  );

CREATE POLICY "tasks_internal_insert" ON public.tasks
  FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'corretor'::app_role)
    OR has_role(auth.uid(), 'vendas'::app_role)
    OR has_role(auth.uid(), 'locacao'::app_role)
    OR is_admin(auth.uid())
  );

CREATE POLICY "tasks_owner_update" ON public.tasks
  FOR UPDATE TO authenticated
  USING (
    assigned_to = auth.uid()
    OR created_by = auth.uid()
    OR is_admin(auth.uid())
  );

CREATE POLICY "tasks_owner_delete" ON public.tasks
  FOR DELETE TO authenticated
  USING (
    created_by = auth.uid()
    OR is_admin(auth.uid())
  );

CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Auto preencher completed_at quando status = done
CREATE OR REPLACE FUNCTION public.tasks_set_completed_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'done' AND (OLD.status IS DISTINCT FROM 'done') THEN
    NEW.completed_at := now();
  ELSIF NEW.status <> 'done' THEN
    NEW.completed_at := NULL;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_tasks_completed_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.tasks_set_completed_at();
