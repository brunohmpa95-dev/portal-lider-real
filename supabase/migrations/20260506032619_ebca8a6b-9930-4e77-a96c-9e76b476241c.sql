
-- ============================================================
-- 1. Novos campos em property_leads
-- ============================================================
ALTER TABLE public.property_leads
  ADD COLUMN IF NOT EXISTS distributed_at timestamptz,
  ADD COLUMN IF NOT EXISTS first_response_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_interaction_at timestamptz,
  ADD COLUMN IF NOT EXISTS sla_status text NOT NULL DEFAULT 'on_time',
  ADD COLUMN IF NOT EXISTS distribution_rule_id uuid,
  ADD COLUMN IF NOT EXISTS redistribution_count integer NOT NULL DEFAULT 0;

-- ============================================================
-- 2. Tabela de regras de distribuição
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lead_distribution_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  priority integer NOT NULL DEFAULT 100,
  mode text NOT NULL DEFAULT 'round_robin', -- 'round_robin' | 'manual_suggest' | 'property_owner' | 'region'
  -- condições (todas opcionais; se nulo, ignora)
  match_sources text[] DEFAULT '{}',         -- ex: ['website','whatsapp']
  match_neighborhoods text[] DEFAULT '{}',
  match_property_types text[] DEFAULT '{}',
  match_purposes text[] DEFAULT '{}',
  min_price numeric,
  max_price numeric,
  -- corretores elegíveis (user_ids)
  eligible_user_ids uuid[] NOT NULL DEFAULT '{}',
  -- ações pós-distribuição
  create_task boolean NOT NULL DEFAULT true,
  notify_assignee boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_distribution_rules ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_dist_rules_active_prio
  ON public.lead_distribution_rules(is_active, priority);

-- ============================================================
-- 3. Estado do rodízio por regra
-- ============================================================
CREATE TABLE IF NOT EXISTS public.broker_rotation_state (
  rule_id uuid PRIMARY KEY REFERENCES public.lead_distribution_rules(id) ON DELETE CASCADE,
  last_user_id uuid,
  last_index integer NOT NULL DEFAULT -1,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.broker_rotation_state ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. Logs de distribuição
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lead_distribution_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL,
  rule_id uuid,
  assigned_user_id uuid,
  previous_user_id uuid,
  action text NOT NULL, -- 'assigned' | 'redistributed' | 'no_match' | 'manual_suggest' | 'failed'
  reason text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_distribution_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_dist_logs_lead ON public.lead_distribution_logs(lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dist_logs_created ON public.lead_distribution_logs(created_at DESC);

-- ============================================================
-- 5. Config de SLA
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lead_sla_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  match_sources text[] DEFAULT '{}',
  match_purposes text[] DEFAULT '{}',
  first_response_minutes integer NOT NULL DEFAULT 15,
  warning_minutes integer NOT NULL DEFAULT 10,
  no_interaction_hours integer NOT NULL DEFAULT 24,
  on_breach_actions text[] NOT NULL DEFAULT ARRAY['notify','task','redistribute'],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_sla_config ENABLE ROW LEVEL SECURITY;

-- Eventos de SLA
CREATE TABLE IF NOT EXISTS public.lead_sla_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL,
  event_type text NOT NULL, -- 'warning' | 'breached' | 'recovered' | 'redistributed'
  sla_config_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_sla_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_sla_events_lead ON public.lead_sla_events(lead_id, created_at DESC);

-- ============================================================
-- 6. Automações
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lead_automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  -- evento disparador
  trigger_event text NOT NULL, -- 'lead_created' | 'stage_changed' | 'no_response' | 'assigned' | 'redistributed'
  trigger_from_stage text,
  trigger_to_stage text,
  -- ação
  action_type text NOT NULL,   -- 'create_task' | 'notify_user' | 'add_tag' | 'set_priority'
  action_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_automation_rules ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 7. RLS Policies
-- ============================================================

-- distribution_rules
CREATE POLICY "dist_rules_internal_read" ON public.lead_distribution_rules
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'corretor'::app_role) OR has_role(auth.uid(),'vendas'::app_role)
      OR has_role(auth.uid(),'locacao'::app_role) OR is_admin(auth.uid()));

CREATE POLICY "dist_rules_admin_write" ON public.lead_distribution_rules
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- rotation_state
CREATE POLICY "rotation_internal_read" ON public.broker_rotation_state
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'corretor'::app_role) OR has_role(auth.uid(),'vendas'::app_role)
      OR has_role(auth.uid(),'locacao'::app_role) OR is_admin(auth.uid()));

CREATE POLICY "rotation_admin_write" ON public.broker_rotation_state
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- distribution_logs
CREATE POLICY "dist_logs_internal_read" ON public.lead_distribution_logs
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'corretor'::app_role) OR has_role(auth.uid(),'vendas'::app_role)
      OR has_role(auth.uid(),'locacao'::app_role) OR is_admin(auth.uid()));

CREATE POLICY "dist_logs_admin_insert" ON public.lead_distribution_logs
  FOR INSERT TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "dist_logs_service_insert" ON public.lead_distribution_logs
  FOR INSERT TO service_role WITH CHECK (true);

-- sla_config
CREATE POLICY "sla_cfg_internal_read" ON public.lead_sla_config
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'corretor'::app_role) OR has_role(auth.uid(),'vendas'::app_role)
      OR has_role(auth.uid(),'locacao'::app_role) OR is_admin(auth.uid()));

CREATE POLICY "sla_cfg_admin_write" ON public.lead_sla_config
  FOR ALL TO authenticated
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- sla_events
CREATE POLICY "sla_events_internal_read" ON public.lead_sla_events
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'corretor'::app_role) OR has_role(auth.uid(),'vendas'::app_role)
      OR has_role(auth.uid(),'locacao'::app_role) OR is_admin(auth.uid()));

CREATE POLICY "sla_events_service_insert" ON public.lead_sla_events
  FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "sla_events_admin_insert" ON public.lead_sla_events
  FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));

-- automation_rules
CREATE POLICY "auto_rules_internal_read" ON public.lead_automation_rules
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'corretor'::app_role) OR has_role(auth.uid(),'vendas'::app_role)
      OR has_role(auth.uid(),'locacao'::app_role) OR is_admin(auth.uid()));

CREATE POLICY "auto_rules_admin_write" ON public.lead_automation_rules
  FOR ALL TO authenticated
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- ============================================================
-- 8. Triggers updated_at + auditoria
-- ============================================================
CREATE TRIGGER trg_dist_rules_updated BEFORE UPDATE ON public.lead_distribution_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_sla_cfg_updated BEFORE UPDATE ON public.lead_sla_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_auto_rules_updated BEFORE UPDATE ON public.lead_automation_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_audit_dist_rules
  AFTER INSERT OR UPDATE OR DELETE ON public.lead_distribution_rules
  FOR EACH ROW EXECUTE FUNCTION public.audit_critical_changes();
CREATE TRIGGER trg_audit_sla_cfg
  AFTER INSERT OR UPDATE OR DELETE ON public.lead_sla_config
  FOR EACH ROW EXECUTE FUNCTION public.audit_critical_changes();
CREATE TRIGGER trg_audit_auto_rules
  AFTER INSERT OR UPDATE OR DELETE ON public.lead_automation_rules
  FOR EACH ROW EXECUTE FUNCTION public.audit_critical_changes();

-- ============================================================
-- 9. Trigger SLA: atualiza first_response_at e last_interaction_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_lead_interaction_timestamps()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.property_leads
     SET last_interaction_at = now(),
         first_response_at = COALESCE(first_response_at, now()),
         sla_status = CASE WHEN sla_status = 'breached' THEN 'breached' ELSE 'on_time' END
   WHERE id = NEW.lead_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_lead_interaction_sla ON public.lead_interactions;
CREATE TRIGGER trg_lead_interaction_sla
  AFTER INSERT ON public.lead_interactions
  FOR EACH ROW EXECUTE FUNCTION public.update_lead_interaction_timestamps();

-- ============================================================
-- 10. Função core: distribui um lead conforme regras
-- ============================================================
CREATE OR REPLACE FUNCTION public.apply_distribution_rules(_lead_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _lead public.property_leads;
  _prop public.properties;
  _rule public.lead_distribution_rules;
  _assigned uuid;
  _idx integer;
  _next_idx integer;
  _state public.broker_rotation_state;
BEGIN
  SELECT * INTO _lead FROM public.property_leads WHERE id = _lead_id;
  IF _lead IS NULL THEN RETURN NULL; END IF;

  IF _lead.property_id IS NOT NULL THEN
    SELECT * INTO _prop FROM public.properties WHERE id = _lead.property_id;
  END IF;

  -- Itera regras por prioridade
  FOR _rule IN
    SELECT * FROM public.lead_distribution_rules
     WHERE is_active = true
     ORDER BY priority ASC, created_at ASC
  LOOP
    -- Filtros
    IF array_length(_rule.match_sources,1) > 0 AND NOT (_lead.source = ANY(_rule.match_sources)) THEN CONTINUE; END IF;
    IF array_length(_rule.match_purposes,1) > 0 AND _prop.purpose IS NOT NULL AND NOT (_prop.purpose = ANY(_rule.match_purposes)) THEN CONTINUE; END IF;
    IF array_length(_rule.match_property_types,1) > 0 AND _prop.type IS NOT NULL AND NOT (_prop.type = ANY(_rule.match_property_types)) THEN CONTINUE; END IF;
    IF array_length(_rule.match_neighborhoods,1) > 0 AND _prop.neighborhood IS NOT NULL AND NOT (_prop.neighborhood = ANY(_rule.match_neighborhoods)) THEN CONTINUE; END IF;
    IF _rule.min_price IS NOT NULL AND COALESCE(_prop.price,0) < _rule.min_price THEN CONTINUE; END IF;
    IF _rule.max_price IS NOT NULL AND COALESCE(_prop.price,0) > _rule.max_price THEN CONTINUE; END IF;

    -- Modo property_owner
    IF _rule.mode = 'property_owner' AND _prop.responsible_agent IS NOT NULL THEN
      _assigned := _prop.responsible_agent;
    -- Modo round_robin
    ELSIF _rule.mode = 'round_robin' AND array_length(_rule.eligible_user_ids,1) > 0 THEN
      SELECT * INTO _state FROM public.broker_rotation_state WHERE rule_id = _rule.id;
      _idx := COALESCE(_state.last_index, -1);
      _next_idx := (_idx + 1) % array_length(_rule.eligible_user_ids,1);
      _assigned := _rule.eligible_user_ids[_next_idx + 1];
      INSERT INTO public.broker_rotation_state(rule_id,last_user_id,last_index)
        VALUES (_rule.id, _assigned, _next_idx)
        ON CONFLICT (rule_id) DO UPDATE SET last_user_id=_assigned, last_index=_next_idx, updated_at=now();
    -- Manual sugere primeiro elegível mas não atribui
    ELSIF _rule.mode = 'manual_suggest' AND array_length(_rule.eligible_user_ids,1) > 0 THEN
      INSERT INTO public.lead_distribution_logs(lead_id,rule_id,assigned_user_id,action,reason,metadata)
        VALUES (_lead_id, _rule.id, _rule.eligible_user_ids[1], 'manual_suggest',
                'Regra "'||_rule.name||'" sugere atribuição manual',
                jsonb_build_object('suggested', _rule.eligible_user_ids[1]));
      RETURN NULL;
    END IF;

    IF _assigned IS NOT NULL THEN
      UPDATE public.property_leads
         SET assigned_to = _assigned,
             distributed_at = now(),
             distribution_rule_id = _rule.id,
             updated_at = now()
       WHERE id = _lead_id;

      INSERT INTO public.lead_distribution_logs(lead_id,rule_id,assigned_user_id,previous_user_id,action,reason,metadata)
        VALUES (_lead_id, _rule.id, _assigned, _lead.assigned_to, 'assigned',
                'Aplicada regra "'||_rule.name||'" ('||_rule.mode||')',
                jsonb_build_object('mode',_rule.mode));

      RETURN _assigned;
    END IF;
  END LOOP;

  -- Sem match
  INSERT INTO public.lead_distribution_logs(lead_id,action,reason)
    VALUES (_lead_id,'no_match','Nenhuma regra ativa correspondeu ao lead');
  RETURN NULL;
END;
$$;

-- ============================================================
-- 11. Função: redistribuir lead (SLA breach)
-- ============================================================
CREATE OR REPLACE FUNCTION public.redistribute_lead(_lead_id uuid, _reason text DEFAULT 'sla_breach')
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _new uuid; _lead public.property_leads;
BEGIN
  SELECT * INTO _lead FROM public.property_leads WHERE id = _lead_id;
  IF _lead IS NULL THEN RETURN NULL; END IF;

  UPDATE public.property_leads
     SET assigned_to = NULL,
         redistribution_count = redistribution_count + 1,
         sla_status = 'breached'
   WHERE id = _lead_id;

  _new := public.apply_distribution_rules(_lead_id);

  INSERT INTO public.lead_distribution_logs(lead_id, assigned_user_id, previous_user_id, action, reason, metadata)
    VALUES (_lead_id, _new, _lead.assigned_to, 'redistributed', _reason,
            jsonb_build_object('previous_count', _lead.redistribution_count));

  INSERT INTO public.lead_sla_events(lead_id, event_type, metadata)
    VALUES (_lead_id, 'redistributed', jsonb_build_object('reason', _reason, 'new_assignee', _new));

  RETURN _new;
END;
$$;

-- ============================================================
-- 12. Permissões (seeds)
-- ============================================================
INSERT INTO public.permissions(code, module, action, description) VALUES
  ('leads.distribute','leads','distribute','Disparar distribuição manual'),
  ('leads.rules.read','leads','rules.read','Ver regras de distribuição'),
  ('leads.rules.write','leads','rules.write','Criar/editar regras de distribuição'),
  ('leads.sla.read','leads','sla.read','Ver configuração de SLA'),
  ('leads.sla.write','leads','sla.write','Editar configuração de SLA'),
  ('leads.automation.read','leads','automation.read','Ver automações'),
  ('leads.automation.write','leads','automation.write','Editar automações'),
  ('leads.logs.read','leads','logs.read','Ver logs de distribuição')
ON CONFLICT (code) DO NOTHING;

-- Atribui aos perfis
INSERT INTO public.role_permissions(role, permission_code)
SELECT r.role, p.code
FROM (VALUES
  ('superadmin'::app_role,'leads.distribute'),
  ('superadmin','leads.rules.read'),('superadmin','leads.rules.write'),
  ('superadmin','leads.sla.read'),('superadmin','leads.sla.write'),
  ('superadmin','leads.automation.read'),('superadmin','leads.automation.write'),
  ('superadmin','leads.logs.read'),
  ('administrativo','leads.distribute'),
  ('administrativo','leads.rules.read'),('administrativo','leads.rules.write'),
  ('administrativo','leads.sla.read'),('administrativo','leads.sla.write'),
  ('administrativo','leads.automation.read'),('administrativo','leads.automation.write'),
  ('administrativo','leads.logs.read'),
  ('vendas','leads.rules.read'),('vendas','leads.sla.read'),
  ('vendas','leads.automation.read'),('vendas','leads.logs.read'),
  ('locacao','leads.rules.read'),('locacao','leads.sla.read'),
  ('locacao','leads.automation.read'),('locacao','leads.logs.read'),
  ('corretor','leads.logs.read')
) AS r(role,code)
JOIN public.permissions p ON p.code = r.code
ON CONFLICT DO NOTHING;

-- SLA padrão de 15min
INSERT INTO public.lead_sla_config(name, first_response_minutes, warning_minutes, no_interaction_hours, on_breach_actions)
SELECT 'SLA Padrão (15min)', 15, 10, 24, ARRAY['notify','task','redistribute']
WHERE NOT EXISTS (SELECT 1 FROM public.lead_sla_config);
