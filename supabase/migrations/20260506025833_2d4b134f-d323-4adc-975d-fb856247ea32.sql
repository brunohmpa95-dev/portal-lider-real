
-- =========================================
-- PERMISSIONS CATALOG
-- =========================================
CREATE TABLE IF NOT EXISTS public.permissions (
  code text PRIMARY KEY,
  module text NOT NULL,
  action text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "permissions_authenticated_read" ON public.permissions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "permissions_superadmin_write" ON public.permissions
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'superadmin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));

-- =========================================
-- ROLE -> PERMISSIONS MATRIX
-- =========================================
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  permission_code text NOT NULL REFERENCES public.permissions(code) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(role, permission_code)
);

CREATE INDEX idx_role_permissions_role ON public.role_permissions(role);

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "role_perms_authenticated_read" ON public.role_permissions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "role_perms_superadmin_write" ON public.role_permissions
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'superadmin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));

-- has_permission helper
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _code text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role = ur.role
    WHERE ur.user_id = _user_id
      AND rp.permission_code = _code
  )
$$;

-- get_my_permissions helper (returns array of codes for current user)
CREATE OR REPLACE FUNCTION public.get_my_permissions()
RETURNS text[]
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(array_agg(DISTINCT rp.permission_code), '{}')
  FROM public.user_roles ur
  JOIN public.role_permissions rp ON rp.role = ur.role
  WHERE ur.user_id = auth.uid()
$$;

-- =========================================
-- SEED PERMISSIONS
-- =========================================
INSERT INTO public.permissions (code, module, action, description) VALUES
  -- Leads
  ('leads.read', 'leads', 'read', 'Ver leads'),
  ('leads.write', 'leads', 'write', 'Criar e editar leads'),
  ('leads.delete', 'leads', 'delete', 'Excluir leads'),
  ('leads.export', 'leads', 'export', 'Exportar leads'),
  ('leads.assign', 'leads', 'assign', 'Atribuir leads a corretores'),
  -- Properties
  ('properties.read', 'properties', 'read', 'Ver imóveis'),
  ('properties.write', 'properties', 'write', 'Criar e editar imóveis'),
  ('properties.delete', 'properties', 'delete', 'Excluir imóveis'),
  ('properties.archive', 'properties', 'archive', 'Arquivar imóveis'),
  ('properties.publish', 'properties', 'publish', 'Publicar imóveis em portais'),
  -- Clients
  ('clients.read', 'clients', 'read', 'Ver clientes'),
  ('clients.write', 'clients', 'write', 'Criar e editar clientes'),
  ('clients.delete', 'clients', 'delete', 'Excluir clientes'),
  -- Finance
  ('finance.read', 'finance', 'read', 'Ver dados financeiros'),
  ('finance.write', 'finance', 'write', 'Criar e editar lançamentos'),
  ('finance.delete', 'finance', 'delete', 'Excluir lançamentos'),
  ('finance.approve', 'finance', 'approve', 'Aprovar pagamentos'),
  ('finance.export', 'finance', 'export', 'Exportar dados financeiros'),
  -- Reports
  ('reports.read', 'reports', 'read', 'Ver relatórios'),
  ('reports.export', 'reports', 'export', 'Exportar relatórios'),
  ('reports.financial', 'reports', 'financial', 'Ver relatórios financeiros'),
  ('reports.management', 'reports', 'management', 'Ver dashboard gerencial'),
  -- Users
  ('users.read', 'users', 'read', 'Ver usuários'),
  ('users.write', 'users', 'write', 'Criar e editar usuários'),
  ('users.manage_roles', 'users', 'manage_roles', 'Gerenciar perfis de acesso'),
  ('users.manage_permissions', 'users', 'manage_permissions', 'Gerenciar matriz de permissões'),
  -- Audit
  ('audit.read', 'audit', 'read', 'Ver log de auditoria'),
  ('audit.export', 'audit', 'export', 'Exportar log de auditoria'),
  -- Automations
  ('automations.read', 'automations', 'read', 'Ver automações'),
  ('automations.write', 'automations', 'write', 'Configurar automações'),
  -- Portals
  ('portals.read', 'portals', 'read', 'Ver portais'),
  ('portals.write', 'portals', 'write', 'Configurar portais'),
  ('portals.publish', 'portals', 'publish', 'Publicar imóveis em portais'),
  -- AI
  ('ai.use', 'ai', 'use', 'Usar funcionalidades de IA'),
  ('ai.insights', 'ai', 'insights', 'Ver insights de IA'),
  -- Settings
  ('settings.read', 'settings', 'read', 'Ver configurações'),
  ('settings.write', 'settings', 'write', 'Alterar configurações')
ON CONFLICT (code) DO NOTHING;

-- =========================================
-- SEED ROLE -> PERMISSIONS
-- =========================================
-- superadmin: tudo
INSERT INTO public.role_permissions (role, permission_code)
SELECT 'superadmin'::app_role, code FROM public.permissions
ON CONFLICT DO NOTHING;

-- administrativo: tudo exceto manage_permissions
INSERT INTO public.role_permissions (role, permission_code)
SELECT 'administrativo'::app_role, code FROM public.permissions
WHERE code NOT IN ('users.manage_permissions')
ON CONFLICT DO NOTHING;

-- financeiro
INSERT INTO public.role_permissions (role, permission_code) VALUES
  ('financeiro', 'leads.read'),
  ('financeiro', 'properties.read'),
  ('financeiro', 'clients.read'),
  ('financeiro', 'finance.read'),
  ('financeiro', 'finance.write'),
  ('financeiro', 'finance.approve'),
  ('financeiro', 'finance.export'),
  ('financeiro', 'reports.read'),
  ('financeiro', 'reports.financial'),
  ('financeiro', 'reports.export'),
  ('financeiro', 'audit.read')
ON CONFLICT DO NOTHING;

-- vendas
INSERT INTO public.role_permissions (role, permission_code) VALUES
  ('vendas', 'leads.read'), ('vendas', 'leads.write'), ('vendas', 'leads.assign'), ('vendas', 'leads.export'),
  ('vendas', 'properties.read'), ('vendas', 'properties.write'),
  ('vendas', 'clients.read'), ('vendas', 'clients.write'),
  ('vendas', 'reports.read'), ('vendas', 'reports.management'),
  ('vendas', 'automations.read'),
  ('vendas', 'portals.read'), ('vendas', 'portals.publish'),
  ('vendas', 'ai.use'), ('vendas', 'ai.insights')
ON CONFLICT DO NOTHING;

-- locacao
INSERT INTO public.role_permissions (role, permission_code) VALUES
  ('locacao', 'leads.read'), ('locacao', 'leads.write'),
  ('locacao', 'properties.read'), ('locacao', 'properties.write'),
  ('locacao', 'clients.read'), ('locacao', 'clients.write'),
  ('locacao', 'reports.read'),
  ('locacao', 'ai.use')
ON CONFLICT DO NOTHING;

-- corretor
INSERT INTO public.role_permissions (role, permission_code) VALUES
  ('corretor', 'leads.read'), ('corretor', 'leads.write'),
  ('corretor', 'properties.read'), ('corretor', 'properties.write'),
  ('corretor', 'clients.read'), ('corretor', 'clients.write'),
  ('corretor', 'ai.use')
ON CONFLICT DO NOTHING;

-- corretor_parceiro
INSERT INTO public.role_permissions (role, permission_code) VALUES
  ('corretor_parceiro', 'leads.read'),
  ('corretor_parceiro', 'properties.read')
ON CONFLICT DO NOTHING;

-- =========================================
-- FINANCE: ACCOUNTS
-- =========================================
CREATE TABLE IF NOT EXISTS public.finance_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('bank','cash','digital_wallet','credit_card')),
  bank_name text,
  agency text,
  account_number text,
  initial_balance numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

CREATE TRIGGER finance_accounts_updated_at BEFORE UPDATE ON public.finance_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.finance_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fin_accounts_read" ON public.finance_accounts
  FOR SELECT TO authenticated
  USING (has_permission(auth.uid(), 'finance.read'));

CREATE POLICY "fin_accounts_write" ON public.finance_accounts
  FOR INSERT TO authenticated
  WITH CHECK (has_permission(auth.uid(), 'finance.write'));

CREATE POLICY "fin_accounts_update" ON public.finance_accounts
  FOR UPDATE TO authenticated
  USING (has_permission(auth.uid(), 'finance.write'));

CREATE POLICY "fin_accounts_delete" ON public.finance_accounts
  FOR DELETE TO authenticated
  USING (has_permission(auth.uid(), 'finance.delete'));

-- =========================================
-- FINANCE: CATEGORIES (hierarchical)
-- =========================================
CREATE TABLE IF NOT EXISTS public.finance_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('income','expense')),
  parent_id uuid REFERENCES public.finance_categories(id) ON DELETE SET NULL,
  color text DEFAULT '#5B9A2D',
  icon text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fin_categories_kind ON public.finance_categories(kind);
CREATE INDEX idx_fin_categories_parent ON public.finance_categories(parent_id);

CREATE TRIGGER finance_categories_updated_at BEFORE UPDATE ON public.finance_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.finance_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fin_cats_read" ON public.finance_categories
  FOR SELECT TO authenticated USING (has_permission(auth.uid(), 'finance.read'));

CREATE POLICY "fin_cats_write" ON public.finance_categories
  FOR ALL TO authenticated
  USING (has_permission(auth.uid(), 'finance.write'))
  WITH CHECK (has_permission(auth.uid(), 'finance.write'));

-- Seed categories
INSERT INTO public.finance_categories (name, kind, icon, sort_order) VALUES
  ('Comissões de Venda', 'income', 'TrendingUp', 1),
  ('Comissões de Locação', 'income', 'Home', 2),
  ('Taxa de Administração', 'income', 'Percent', 3),
  ('Taxa de Intermediação', 'income', 'Handshake', 4),
  ('Outras Receitas', 'income', 'PlusCircle', 99),
  ('Folha de Pagamento', 'expense', 'Users', 1),
  ('Marketing e Publicidade', 'expense', 'Megaphone', 2),
  ('Portais Imobiliários', 'expense', 'Globe', 3),
  ('Aluguel de Sala', 'expense', 'Building', 4),
  ('Impostos e Taxas', 'expense', 'FileText', 5),
  ('Tecnologia', 'expense', 'Laptop', 6),
  ('Despesas Operacionais', 'expense', 'Box', 7),
  ('Outras Despesas', 'expense', 'MinusCircle', 99)
ON CONFLICT DO NOTHING;

-- =========================================
-- FINANCE: TRANSACTIONS
-- =========================================
CREATE TABLE IF NOT EXISTS public.finance_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('income','expense')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','canceled')),
  amount numeric NOT NULL CHECK (amount >= 0),
  description text NOT NULL,
  category_id uuid REFERENCES public.finance_categories(id) ON DELETE SET NULL,
  account_id uuid REFERENCES public.finance_accounts(id) ON DELETE SET NULL,
  due_date date,
  paid_date date,
  payment_method text,
  reference_type text CHECK (reference_type IN ('commission','contract','property','lead','broker','manual')),
  reference_id uuid,
  attachment_url text,
  notes text,
  created_by uuid,
  confirmed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fin_tx_due ON public.finance_transactions(due_date);
CREATE INDEX idx_fin_tx_status ON public.finance_transactions(status);
CREATE INDEX idx_fin_tx_kind ON public.finance_transactions(kind);
CREATE INDEX idx_fin_tx_category ON public.finance_transactions(category_id);
CREATE INDEX idx_fin_tx_account ON public.finance_transactions(account_id);
CREATE INDEX idx_fin_tx_reference ON public.finance_transactions(reference_type, reference_id);

CREATE TRIGGER finance_transactions_updated_at BEFORE UPDATE ON public.finance_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fin_tx_read" ON public.finance_transactions
  FOR SELECT TO authenticated USING (has_permission(auth.uid(), 'finance.read'));

CREATE POLICY "fin_tx_insert" ON public.finance_transactions
  FOR INSERT TO authenticated
  WITH CHECK (has_permission(auth.uid(), 'finance.write'));

CREATE POLICY "fin_tx_update" ON public.finance_transactions
  FOR UPDATE TO authenticated
  USING (has_permission(auth.uid(), 'finance.write'));

CREATE POLICY "fin_tx_delete" ON public.finance_transactions
  FOR DELETE TO authenticated
  USING (has_permission(auth.uid(), 'finance.delete'));

-- =========================================
-- FINANCE: RECURRING
-- =========================================
CREATE TABLE IF NOT EXISTS public.finance_recurring (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  template jsonb NOT NULL,
  frequency text NOT NULL CHECK (frequency IN ('monthly','weekly','yearly')),
  day_of_month integer CHECK (day_of_month BETWEEN 1 AND 31),
  next_run_at date NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

CREATE TRIGGER finance_recurring_updated_at BEFORE UPDATE ON public.finance_recurring
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.finance_recurring ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fin_recurring_read" ON public.finance_recurring
  FOR SELECT TO authenticated USING (has_permission(auth.uid(), 'finance.read'));

CREATE POLICY "fin_recurring_write" ON public.finance_recurring
  FOR ALL TO authenticated
  USING (has_permission(auth.uid(), 'finance.write'))
  WITH CHECK (has_permission(auth.uid(), 'finance.write'));

-- =========================================
-- AUDIT HELPERS
-- =========================================
CREATE OR REPLACE FUNCTION public.log_audit(
  _action text,
  _target_type text,
  _target_id text,
  _metadata jsonb DEFAULT '{}'::jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_log (user_id, action, resource, target_type, target_id, metadata, result)
  VALUES (auth.uid(), _action, _target_type, _target_type, _target_id, _metadata, 'success');
END;
$$;

CREATE OR REPLACE FUNCTION public.audit_critical_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _action text;
  _target_id text;
  _meta jsonb;
BEGIN
  IF TG_OP = 'INSERT' THEN
    _action := TG_TABLE_NAME || '.create';
    _target_id := NEW.id::text;
    _meta := jsonb_build_object('new', to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    _action := TG_TABLE_NAME || '.update';
    _target_id := NEW.id::text;
    _meta := jsonb_build_object('changed_fields', (
      SELECT jsonb_object_agg(key, jsonb_build_object('old', o.value, 'new', n.value))
      FROM jsonb_each(to_jsonb(OLD)) o
      JOIN jsonb_each(to_jsonb(NEW)) n USING (key)
      WHERE o.value IS DISTINCT FROM n.value AND key NOT IN ('updated_at')
    ));
  ELSIF TG_OP = 'DELETE' THEN
    _action := TG_TABLE_NAME || '.delete';
    _target_id := OLD.id::text;
    _meta := jsonb_build_object('deleted', to_jsonb(OLD));
  END IF;

  INSERT INTO public.audit_log (user_id, action, resource, target_type, target_id, metadata, result)
  VALUES (auth.uid(), _action, TG_TABLE_NAME, TG_TABLE_NAME, _target_id, COALESCE(_meta, '{}'::jsonb), 'success');

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply triggers
DROP TRIGGER IF EXISTS audit_user_roles_changes ON public.user_roles;
CREATE TRIGGER audit_user_roles_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_critical_changes();

DROP TRIGGER IF EXISTS audit_role_permissions_changes ON public.role_permissions;
CREATE TRIGGER audit_role_permissions_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.role_permissions
  FOR EACH ROW EXECUTE FUNCTION public.audit_critical_changes();

DROP TRIGGER IF EXISTS audit_finance_transactions_changes ON public.finance_transactions;
CREATE TRIGGER audit_finance_transactions_changes
  AFTER UPDATE OR DELETE ON public.finance_transactions
  FOR EACH ROW EXECUTE FUNCTION public.audit_critical_changes();

DROP TRIGGER IF EXISTS audit_commissions_changes ON public.commissions;
CREATE TRIGGER audit_commissions_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.commissions
  FOR EACH ROW EXECUTE FUNCTION public.audit_critical_changes();

DROP TRIGGER IF EXISTS audit_properties_critical ON public.properties;
CREATE TRIGGER audit_properties_critical
  AFTER UPDATE OR DELETE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.audit_critical_changes();

DROP TRIGGER IF EXISTS audit_property_leads_delete ON public.property_leads;
CREATE TRIGGER audit_property_leads_delete
  AFTER DELETE ON public.property_leads
  FOR EACH ROW EXECUTE FUNCTION public.audit_critical_changes();
