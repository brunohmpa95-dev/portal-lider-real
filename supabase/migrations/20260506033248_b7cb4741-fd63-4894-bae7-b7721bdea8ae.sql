
-- ============================================================
-- 1. Fila de automação
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lead_automation_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL,
  event_type text NOT NULL,             -- 'lead_created' | 'stage_changed' | 'assigned'
  from_stage text,
  to_stage text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  processed_at timestamptz,
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auto_queue_pending
  ON public.lead_automation_queue (created_at)
  WHERE processed_at IS NULL;

ALTER TABLE public.lead_automation_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auto_queue_internal_read" ON public.lead_automation_queue
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'corretor'::app_role) OR has_role(auth.uid(),'vendas'::app_role)
      OR has_role(auth.uid(),'locacao'::app_role) OR is_admin(auth.uid()));

CREATE POLICY "auto_queue_service_all" ON public.lead_automation_queue
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- 2. Trigger de captura em property_leads
-- ============================================================
CREATE OR REPLACE FUNCTION public.capture_lead_automation_events()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.lead_automation_queue(lead_id, event_type, to_stage, payload)
    VALUES (NEW.id, 'lead_created', NEW.funnel_stage,
            jsonb_build_object('source', NEW.source, 'assigned_to', NEW.assigned_to));
  ELSIF TG_OP = 'UPDATE' THEN
    -- Mudança de estágio
    IF NEW.funnel_stage IS DISTINCT FROM OLD.funnel_stage THEN
      INSERT INTO public.lead_automation_queue(lead_id, event_type, from_stage, to_stage, payload)
      VALUES (NEW.id, 'stage_changed', OLD.funnel_stage, NEW.funnel_stage,
              jsonb_build_object('assigned_to', NEW.assigned_to));
    END IF;
    -- Atribuição (de NULL para algo)
    IF OLD.assigned_to IS NULL AND NEW.assigned_to IS NOT NULL THEN
      INSERT INTO public.lead_automation_queue(lead_id, event_type, payload)
      VALUES (NEW.id, 'assigned',
              jsonb_build_object('assigned_to', NEW.assigned_to));
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_lead_automation_capture ON public.property_leads;
CREATE TRIGGER trg_lead_automation_capture
  AFTER INSERT OR UPDATE ON public.property_leads
  FOR EACH ROW EXECUTE FUNCTION public.capture_lead_automation_events();

-- ============================================================
-- 3. Realtime
-- ============================================================
ALTER TABLE public.property_leads REPLICA IDENTITY FULL;
ALTER TABLE public.lead_distribution_logs REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.property_leads;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.lead_distribution_logs;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
