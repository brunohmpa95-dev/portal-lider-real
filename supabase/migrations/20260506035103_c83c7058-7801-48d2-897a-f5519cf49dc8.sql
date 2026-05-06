ALTER TABLE public.lead_interactions
  ADD COLUMN IF NOT EXISTS outcome text,
  ADD COLUMN IF NOT EXISTS next_step text,
  ADD COLUMN IF NOT EXISTS next_step_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS funnel_stage_at_time text;

CREATE INDEX IF NOT EXISTS idx_lead_interactions_lead_created
  ON public.lead_interactions(lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_interactions_type
  ON public.lead_interactions(interaction_type);

-- Captura automaticamente a etapa atual do funil ao inserir uma interação,
-- caso o cliente não envie esse valor explicitamente.
CREATE OR REPLACE FUNCTION public.set_interaction_funnel_stage()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.funnel_stage_at_time IS NULL THEN
    SELECT funnel_stage INTO NEW.funnel_stage_at_time
      FROM public.property_leads WHERE id = NEW.lead_id;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_set_interaction_funnel_stage ON public.lead_interactions;
CREATE TRIGGER trg_set_interaction_funnel_stage
BEFORE INSERT ON public.lead_interactions
FOR EACH ROW
EXECUTE FUNCTION public.set_interaction_funnel_stage();

-- Quando há próximo passo agendado, propagar para o follow-up do lead
-- (apenas se o lead não tiver follow-up mais cedo já agendado)
CREATE OR REPLACE FUNCTION public.sync_lead_next_followup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.next_step_at IS NOT NULL THEN
    UPDATE public.property_leads
       SET next_followup_at = LEAST(COALESCE(next_followup_at, NEW.next_step_at), NEW.next_step_at)
     WHERE id = NEW.lead_id;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_sync_lead_next_followup ON public.lead_interactions;
CREATE TRIGGER trg_sync_lead_next_followup
AFTER INSERT ON public.lead_interactions
FOR EACH ROW
WHEN (NEW.next_step_at IS NOT NULL)
EXECUTE FUNCTION public.sync_lead_next_followup();