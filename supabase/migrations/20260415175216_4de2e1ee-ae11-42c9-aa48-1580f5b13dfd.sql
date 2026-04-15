
-- Helper function
CREATE OR REPLACE FUNCTION public.is_broker_partner(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'corretor_parceiro'
  )
$$;

-- clients table
CREATE TABLE public.clients (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cpf_cnpj text,
  rg_ie text,
  birth_date date,
  address text,
  city text DEFAULT 'Itaúna',
  state text DEFAULT 'MG',
  zip_code text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(profile_id)
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "clients_own_read" ON public.clients FOR SELECT TO authenticated
  USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "clients_own_update" ON public.clients FOR UPDATE TO authenticated
  USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "clients_admin_all" ON public.clients FOR ALL TO authenticated
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- brokers table
CREATE TABLE public.brokers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  creci text,
  commission_pct numeric DEFAULT 5,
  status text NOT NULL DEFAULT 'active',
  region text,
  bank_info text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(profile_id)
);
ALTER TABLE public.brokers ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_brokers_updated_at BEFORE UPDATE ON public.brokers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "brokers_own_read" ON public.brokers FOR SELECT TO authenticated
  USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "brokers_own_update" ON public.brokers FOR UPDATE TO authenticated
  USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "brokers_admin_all" ON public.brokers FOR ALL TO authenticated
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- proposals table
CREATE TABLE public.proposals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid REFERENCES public.properties(id),
  client_id uuid REFERENCES public.clients(id),
  broker_id uuid REFERENCES public.brokers(id),
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON public.proposals
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "proposals_broker_read" ON public.proposals FOR SELECT TO authenticated
  USING (broker_id IN (SELECT id FROM public.brokers WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())));
CREATE POLICY "proposals_broker_insert" ON public.proposals FOR INSERT TO authenticated
  WITH CHECK (is_broker_partner(auth.uid()) OR has_role(auth.uid(), 'corretor'::app_role) OR has_role(auth.uid(), 'vendas'::app_role) OR is_admin(auth.uid()));
CREATE POLICY "proposals_broker_update" ON public.proposals FOR UPDATE TO authenticated
  USING (broker_id IN (SELECT id FROM public.brokers WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())) OR is_admin(auth.uid()));
CREATE POLICY "proposals_client_read" ON public.proposals FOR SELECT TO authenticated
  USING (client_id IN (SELECT id FROM public.clients WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())));
CREATE POLICY "proposals_admin_all" ON public.proposals FOR ALL TO authenticated
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- commissions table
CREATE TABLE public.commissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  broker_id uuid NOT NULL REFERENCES public.brokers(id),
  property_id uuid REFERENCES public.properties(id),
  proposal_id uuid REFERENCES public.proposals(id),
  contract_id uuid REFERENCES public.contracts(id),
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  due_date date,
  paid_at date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_commissions_updated_at BEFORE UPDATE ON public.commissions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "commissions_broker_read" ON public.commissions FOR SELECT TO authenticated
  USING (broker_id IN (SELECT id FROM public.brokers WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())));
CREATE POLICY "commissions_finance_read" ON public.commissions FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'financeiro'::app_role) OR is_admin(auth.uid()));
CREATE POLICY "commissions_admin_all" ON public.commissions FOR ALL TO authenticated
  USING (is_admin(auth.uid()) OR has_role(auth.uid(), 'financeiro'::app_role))
  WITH CHECK (is_admin(auth.uid()) OR has_role(auth.uid(), 'financeiro'::app_role));

-- documents_unified table
CREATE TABLE public.documents_unified (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid REFERENCES public.profiles(id),
  property_id uuid REFERENCES public.properties(id),
  contract_id uuid REFERENCES public.contracts(id),
  type text NOT NULL DEFAULT 'general',
  title text NOT NULL,
  file_url text,
  visibility text NOT NULL DEFAULT 'private',
  status text NOT NULL DEFAULT 'active',
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.documents_unified ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_documents_unified_updated_at BEFORE UPDATE ON public.documents_unified
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "docs_uni_own_read" ON public.documents_unified FOR SELECT TO authenticated
  USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "docs_uni_public_read" ON public.documents_unified FOR SELECT TO authenticated
  USING (visibility = 'public');
CREATE POLICY "docs_uni_admin_all" ON public.documents_unified FOR ALL TO authenticated
  USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Alter properties
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS rent_price numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS owner_client_id uuid REFERENCES public.clients(id),
  ADD COLUMN IF NOT EXISTS assigned_broker_id uuid REFERENCES public.brokers(id);

-- Alter visits
ALTER TABLE public.visits
  ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clients(id);

-- Broker partner RLS on existing tables
CREATE POLICY "properties_broker_partner_read" ON public.properties FOR SELECT TO authenticated
  USING (assigned_broker_id IN (SELECT id FROM public.brokers WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())));

CREATE POLICY "visits_broker_partner_read" ON public.visits FOR SELECT TO authenticated
  USING (is_broker_partner(auth.uid()) AND agent_id = auth.uid());
CREATE POLICY "visits_broker_partner_insert" ON public.visits FOR INSERT TO authenticated
  WITH CHECK (is_broker_partner(auth.uid()) AND agent_id = auth.uid());
CREATE POLICY "visits_broker_partner_update" ON public.visits FOR UPDATE TO authenticated
  USING (is_broker_partner(auth.uid()) AND agent_id = auth.uid());

CREATE POLICY "leads_broker_partner_read" ON public.property_leads FOR SELECT TO authenticated
  USING (is_broker_partner(auth.uid()) AND assigned_to = auth.uid());
CREATE POLICY "leads_broker_partner_update" ON public.property_leads FOR UPDATE TO authenticated
  USING (is_broker_partner(auth.uid()) AND assigned_to = auth.uid());
