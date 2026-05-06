-- Trigger: registrar mudança de etapa do funil como evento na timeline (lead_interactions)
CREATE OR REPLACE FUNCTION public.log_lead_stage_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _from_label text;
  _to_label text;
  _stage_labels jsonb := jsonb_build_object(
    'new','Novo',
    'contact','Contato',
    'qualification','Qualificação',
    'visit','Visita',
    'proposal','Proposta',
    'negotiation','Negociação',
    'closed','Fechado (ganho)',
    'lost','Fechado (perdido)'
  );
BEGIN
  IF NEW.funnel_stage IS DISTINCT FROM OLD.funnel_stage THEN
    _from_label := COALESCE(_stage_labels->>OLD.funnel_stage, OLD.funnel_stage);
    _to_label := COALESCE(_stage_labels->>NEW.funnel_stage, NEW.funnel_stage);
    INSERT INTO public.lead_interactions (lead_id, user_id, interaction_type, content)
    VALUES (
      NEW.id,
      COALESCE(auth.uid(), NEW.assigned_to),
      'stage_change',
      'Etapa: ' || _from_label || ' → ' || _to_label
    );
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_log_lead_stage_change ON public.property_leads;
CREATE TRIGGER trg_log_lead_stage_change
AFTER UPDATE OF funnel_stage ON public.property_leads
FOR EACH ROW
EXECUTE FUNCTION public.log_lead_stage_change();

-- Permitir o tipo 'stage_change' em lead_interactions sem auth.uid (o trigger pode rodar sem user para automações futuras)
-- Inserts feitos pelo trigger usam SECURITY DEFINER, então RLS é bypass.