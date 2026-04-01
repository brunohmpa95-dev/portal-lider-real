-- 1. Extend property_leads for full lead management
ALTER TABLE public.property_leads
  ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS funnel_stage text NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS internal_notes text;

-- 2. Extend properties for admin management
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS condominium_fee numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS iptu numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS internal_notes text,
  ADD COLUMN IF NOT EXISTS responsible_agent uuid;

-- 3. Create visits table for agenda
CREATE TABLE public.visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  lead_id uuid REFERENCES public.property_leads(id) ON DELETE SET NULL,
  agent_id uuid NOT NULL,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer DEFAULT 30,
  status text NOT NULL DEFAULT 'scheduled',
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "visits_agent_read" ON public.visits
  FOR SELECT TO authenticated
  USING (agent_id = auth.uid());

CREATE POLICY "visits_internal_read" ON public.visits
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'locacao'::app_role)
    OR has_role(auth.uid(), 'vendas'::app_role)
    OR is_admin(auth.uid())
  );

CREATE POLICY "visits_internal_insert" ON public.visits
  FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'corretor'::app_role)
    OR has_role(auth.uid(), 'locacao'::app_role)
    OR has_role(auth.uid(), 'vendas'::app_role)
    OR is_admin(auth.uid())
  );

CREATE POLICY "visits_internal_update" ON public.visits
  FOR UPDATE TO authenticated
  USING (
    agent_id = auth.uid()
    OR has_role(auth.uid(), 'locacao'::app_role)
    OR has_role(auth.uid(), 'vendas'::app_role)
    OR is_admin(auth.uid())
  );

CREATE POLICY "visits_admin_delete" ON public.visits
  FOR DELETE TO authenticated
  USING (is_admin(auth.uid()));

CREATE TRIGGER update_visits_updated_at
  BEFORE UPDATE ON public.visits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Create lead_interactions table
CREATE TABLE public.lead_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.property_leads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  interaction_type text NOT NULL DEFAULT 'note',
  content text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "interactions_internal_read" ON public.lead_interactions
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'corretor'::app_role)
    OR has_role(auth.uid(), 'locacao'::app_role)
    OR has_role(auth.uid(), 'vendas'::app_role)
    OR is_admin(auth.uid())
  );

CREATE POLICY "interactions_internal_insert" ON public.lead_interactions
  FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'corretor'::app_role)
    OR has_role(auth.uid(), 'locacao'::app_role)
    OR has_role(auth.uid(), 'vendas'::app_role)
    OR is_admin(auth.uid())
  );

CREATE POLICY "interactions_admin_delete" ON public.lead_interactions
  FOR DELETE TO authenticated
  USING (is_admin(auth.uid()));

-- 5. Create notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text,
  type text NOT NULL DEFAULT 'system',
  is_read boolean NOT NULL DEFAULT false,
  link text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_own_read" ON public.notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_own_update" ON public.notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_admin_insert" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "notifications_service_insert" ON public.notifications
  FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY "notifications_own_delete" ON public.notifications
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 6. Add missing INSERT policy for property_leads
CREATE POLICY "leads_internal_insert" ON public.property_leads
  FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'corretor'::app_role)
    OR has_role(auth.uid(), 'vendas'::app_role)
    OR has_role(auth.uid(), 'locacao'::app_role)
    OR is_admin(auth.uid())
  );