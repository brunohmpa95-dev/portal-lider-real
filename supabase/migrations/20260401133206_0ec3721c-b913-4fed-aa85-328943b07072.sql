
-- ============================================================
-- 1. PROPERTIES — dados públicos de imóveis
-- ============================================================
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('sale', 'rent')),
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  neighborhood TEXT,
  city TEXT NOT NULL DEFAULT 'Itaúna',
  state TEXT NOT NULL DEFAULT 'MG',
  address TEXT,
  bedrooms INT NOT NULL DEFAULT 0,
  suites INT NOT NULL DEFAULT 0,
  bathrooms INT NOT NULL DEFAULT 0,
  parking_spots INT NOT NULL DEFAULT 0,
  area NUMERIC(10,2) NOT NULL DEFAULT 0,
  description TEXT,
  features TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_super_featured BOOLEAN NOT NULL DEFAULT false,
  is_new BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'sold', 'rented')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Anyone can view published properties (public catalog)
CREATE POLICY "properties_public_read"
  ON public.properties FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

-- Admins/brokers/sales can see ALL properties (including drafts)
CREATE POLICY "properties_internal_read"
  ON public.properties FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'corretor') OR
    public.has_role(auth.uid(), 'vendas') OR
    public.is_admin(auth.uid())
  );

-- Brokers/sales/admins can create
CREATE POLICY "properties_internal_insert"
  ON public.properties FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'corretor') OR
    public.has_role(auth.uid(), 'vendas') OR
    public.is_admin(auth.uid())
  );

-- Brokers/sales/admins can update
CREATE POLICY "properties_internal_update"
  ON public.properties FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'corretor') OR
    public.has_role(auth.uid(), 'vendas') OR
    public.is_admin(auth.uid())
  );

-- Only admins can delete (soft-delete preferred, but hard-delete protected)
CREATE POLICY "properties_admin_delete"
  ON public.properties FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_properties_status ON public.properties(status);
CREATE INDEX idx_properties_purpose ON public.properties(purpose);
CREATE INDEX idx_properties_type ON public.properties(type);
CREATE INDEX idx_properties_neighborhood ON public.properties(neighborhood);

-- ============================================================
-- 2. PROPERTY_LEADS — interesse em imóveis (dados sensíveis)
-- ============================================================
CREATE TABLE public.property_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  source TEXT DEFAULT 'website',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'archived')),
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.property_leads ENABLE ROW LEVEL SECURITY;

-- Anonymous visitors can submit interest (INSERT only, no read)
CREATE POLICY "leads_anon_insert"
  ON public.property_leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Brokers/sales/rental/admins can view leads
CREATE POLICY "leads_internal_read"
  ON public.property_leads FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'corretor') OR
    public.has_role(auth.uid(), 'vendas') OR
    public.has_role(auth.uid(), 'locacao') OR
    public.is_admin(auth.uid())
  );

-- Brokers/sales can update their assigned leads; admins all
CREATE POLICY "leads_internal_update"
  ON public.property_leads FOR UPDATE
  TO authenticated
  USING (
    (assigned_to = auth.uid() AND (
      public.has_role(auth.uid(), 'corretor') OR
      public.has_role(auth.uid(), 'vendas') OR
      public.has_role(auth.uid(), 'locacao')
    )) OR
    public.is_admin(auth.uid())
  );

-- Only admins can delete leads
CREATE POLICY "leads_admin_delete"
  ON public.property_leads FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE TRIGGER update_property_leads_updated_at
  BEFORE UPDATE ON public.property_leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_property_leads_property_id ON public.property_leads(property_id);
CREATE INDEX idx_property_leads_status ON public.property_leads(status);
CREATE INDEX idx_property_leads_assigned_to ON public.property_leads(assigned_to);

-- ============================================================
-- 3. CONTACT_MESSAGES — formulário de contato geral
-- ============================================================
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  replied_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can submit (INSERT only)
CREATE POLICY "contact_anon_insert"
  ON public.contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins can read
CREATE POLICY "contact_admin_read"
  ON public.contact_messages FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Only admins can update status
CREATE POLICY "contact_admin_update"
  ON public.contact_messages FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Only superadmin can delete
CREATE POLICY "contact_superadmin_delete"
  ON public.contact_messages FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'));

CREATE INDEX idx_contact_messages_status ON public.contact_messages(status);

-- ============================================================
-- 4. LISTING_SUBMISSIONS — cadastro de imóveis por proprietários
-- ============================================================
CREATE TABLE public.listing_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_name TEXT NOT NULL,
  owner_phone TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  purpose TEXT CHECK (purpose IN ('sale', 'rent')),
  property_type TEXT,
  neighborhood TEXT,
  address TEXT,
  bedrooms INT DEFAULT 0,
  bathrooms INT DEFAULT 0,
  parking_spots INT DEFAULT 0,
  area NUMERIC(10,2),
  asking_price NUMERIC(12,2),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'evaluating', 'approved', 'rejected')),
  evaluated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.listing_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit
CREATE POLICY "listing_sub_anon_insert"
  ON public.listing_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Brokers/sales/admins can view
CREATE POLICY "listing_sub_internal_read"
  ON public.listing_submissions FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'corretor') OR
    public.has_role(auth.uid(), 'vendas') OR
    public.is_admin(auth.uid())
  );

-- Admins can update
CREATE POLICY "listing_sub_admin_update"
  ON public.listing_submissions FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Superadmin can delete
CREATE POLICY "listing_sub_superadmin_delete"
  ON public.listing_submissions FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'));

CREATE TRIGGER update_listing_submissions_updated_at
  BEFORE UPDATE ON public.listing_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 5. OMBUDSMAN_TICKETS — ouvidoria (SIGILOSO)
-- ============================================================
CREATE TABLE public.ombudsman_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_name TEXT NOT NULL,
  reporter_email TEXT NOT NULL,
  reporter_phone TEXT,
  ticket_type TEXT NOT NULL CHECK (ticket_type IN ('sugestao', 'reclamacao', 'elogio', 'denuncia')),
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'resolved', 'closed')),
  internal_notes TEXT,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ombudsman_tickets ENABLE ROW LEVEL SECURITY;

-- Anyone can submit
CREATE POLICY "ombudsman_anon_insert"
  ON public.ombudsman_tickets FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ONLY admins can read (confidential data)
CREATE POLICY "ombudsman_admin_read"
  ON public.ombudsman_tickets FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Only admins can update
CREATE POLICY "ombudsman_admin_update"
  ON public.ombudsman_tickets FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Only superadmin can delete (audit trail preservation)
CREATE POLICY "ombudsman_superadmin_delete"
  ON public.ombudsman_tickets FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'));

CREATE TRIGGER update_ombudsman_tickets_updated_at
  BEFORE UPDATE ON public.ombudsman_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 6. JOB_APPLICATIONS — currículos (dados de RH)
-- ============================================================
CREATE TABLE public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT NOT NULL,
  area_of_interest TEXT NOT NULL,
  experience TEXT,
  resume_url TEXT,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'reviewing', 'interview', 'hired', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can submit
CREATE POLICY "jobs_anon_insert"
  ON public.job_applications FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ONLY admins can read (HR confidential)
CREATE POLICY "jobs_admin_read"
  ON public.job_applications FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Only admins can update
CREATE POLICY "jobs_admin_update"
  ON public.job_applications FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Only superadmin can delete
CREATE POLICY "jobs_superadmin_delete"
  ON public.job_applications FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'));

CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 7. CUSTOMER_DOCUMENTS — docs vinculados ao cliente
-- ============================================================
CREATE TABLE public.customer_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  document_type TEXT NOT NULL CHECK (document_type IN ('boleto', 'contrato', 'recibo', 'laudo', 'ficha_cadastral', 'declaracao', 'outro')),
  file_url TEXT,
  is_confidential BOOLEAN NOT NULL DEFAULT false,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_documents ENABLE ROW LEVEL SECURITY;

-- Client can see ONLY their own documents
CREATE POLICY "docs_client_read"
  ON public.customer_documents FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can see all documents
CREATE POLICY "docs_admin_read"
  ON public.customer_documents FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Only admins can create documents for clients
CREATE POLICY "docs_admin_insert"
  ON public.customer_documents FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- Only admins can update
CREATE POLICY "docs_admin_update"
  ON public.customer_documents FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Only superadmin can delete
CREATE POLICY "docs_superadmin_delete"
  ON public.customer_documents FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'));

CREATE INDEX idx_customer_documents_user_id ON public.customer_documents(user_id);
CREATE INDEX idx_customer_documents_type ON public.customer_documents(document_type);

-- ============================================================
-- 8. CONTRACTS — contratos imobiliários
-- ============================================================
CREATE TABLE public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  contract_type TEXT NOT NULL CHECK (contract_type IN ('locacao', 'venda', 'administracao')),
  contract_number TEXT UNIQUE,
  start_date DATE,
  end_date DATE,
  monthly_value NUMERIC(12,2),
  total_value NUMERIC(14,2),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'expired', 'terminated', 'renewed')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Client can see ONLY their own contracts
CREATE POLICY "contracts_client_read"
  ON public.contracts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Rental and admins can see all
CREATE POLICY "contracts_internal_read"
  ON public.contracts FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'locacao') OR
    public.has_role(auth.uid(), 'vendas') OR
    public.is_admin(auth.uid())
  );

-- Only admins/rental can create
CREATE POLICY "contracts_internal_insert"
  ON public.contracts FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'locacao') OR
    public.has_role(auth.uid(), 'vendas') OR
    public.is_admin(auth.uid())
  );

-- Only admins can update
CREATE POLICY "contracts_admin_update"
  ON public.contracts FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Only superadmin can delete
CREATE POLICY "contracts_superadmin_delete"
  ON public.contracts FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'));

CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_contracts_user_id ON public.contracts(user_id);
CREATE INDEX idx_contracts_property_id ON public.contracts(property_id);
CREATE INDEX idx_contracts_status ON public.contracts(status);

-- ============================================================
-- 9. BILLING_RECORDS — registros financeiros
-- ============================================================
CREATE TABLE public.billing_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
  record_type TEXT NOT NULL CHECK (record_type IN ('cobranca', 'pagamento', 'reajuste', 'multa', 'desconto', 'estorno')),
  amount NUMERIC(12,2) NOT NULL,
  due_date DATE,
  paid_date DATE,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'overdue', 'cancelled')),
  reference_month TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.billing_records ENABLE ROW LEVEL SECURITY;

-- Client can see ONLY their own billing records
CREATE POLICY "billing_client_read"
  ON public.billing_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Financial and admins can see all
CREATE POLICY "billing_finance_read"
  ON public.billing_records FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'financeiro') OR
    public.is_admin(auth.uid())
  );

-- Financial and admins can create
CREATE POLICY "billing_finance_insert"
  ON public.billing_records FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'financeiro') OR
    public.is_admin(auth.uid())
  );

-- Financial and admins can update
CREATE POLICY "billing_finance_update"
  ON public.billing_records FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'financeiro') OR
    public.is_admin(auth.uid())
  );

-- Only superadmin can delete financial records
CREATE POLICY "billing_superadmin_delete"
  ON public.billing_records FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'));

CREATE TRIGGER update_billing_records_updated_at
  BEFORE UPDATE ON public.billing_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_billing_records_user_id ON public.billing_records(user_id);
CREATE INDEX idx_billing_records_contract_id ON public.billing_records(contract_id);
CREATE INDEX idx_billing_records_status ON public.billing_records(payment_status);
CREATE INDEX idx_billing_records_due_date ON public.billing_records(due_date);

-- ============================================================
-- 10. SUPPORT_REQUESTS — solicitações de suporte
-- ============================================================
CREATE TABLE public.support_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('manutencao', 'financeiro', 'contrato', 'vistoria', 'geral')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_client', 'resolved', 'closed')),
  internal_notes TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

-- Client can see ONLY their own requests
CREATE POLICY "support_client_read"
  ON public.support_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Client can create their own requests
CREATE POLICY "support_client_insert"
  ON public.support_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Client can update their own requests (add info)
CREATE POLICY "support_client_update"
  ON public.support_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Support/rental/admins can see all
CREATE POLICY "support_internal_read"
  ON public.support_requests FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'locacao') OR
    public.is_admin(auth.uid())
  );

-- Support/admins can update all
CREATE POLICY "support_internal_update"
  ON public.support_requests FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'locacao') OR
    public.is_admin(auth.uid())
  );

-- Only superadmin can delete
CREATE POLICY "support_superadmin_delete"
  ON public.support_requests FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'));

CREATE TRIGGER update_support_requests_updated_at
  BEFORE UPDATE ON public.support_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_support_requests_user_id ON public.support_requests(user_id);
CREATE INDEX idx_support_requests_status ON public.support_requests(status);
CREATE INDEX idx_support_requests_assigned_to ON public.support_requests(assigned_to);

-- ============================================================
-- 11. STORAGE BUCKETS para documentos
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('customer-documents', 'customer-documents', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('property-images', 'property-images', true);

-- Customer documents: client reads own folder, admin reads all
CREATE POLICY "customer_docs_client_read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'customer-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "customer_docs_admin_read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'customer-documents' AND public.is_admin(auth.uid()));

CREATE POLICY "customer_docs_admin_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'customer-documents' AND public.is_admin(auth.uid()));

CREATE POLICY "customer_docs_admin_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'customer-documents' AND public.is_admin(auth.uid()));

-- Resumes: admin only
CREATE POLICY "resumes_admin_read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'resumes' AND public.is_admin(auth.uid()));

CREATE POLICY "resumes_anon_upload"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'resumes');

-- Property images: public read, internal write
CREATE POLICY "property_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images');

CREATE POLICY "property_images_internal_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'property-images' AND (
      public.has_role(auth.uid(), 'corretor') OR
      public.has_role(auth.uid(), 'vendas') OR
      public.is_admin(auth.uid())
    )
  );

CREATE POLICY "property_images_admin_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'property-images' AND public.is_admin(auth.uid()));

-- ============================================================
-- 12. SECURITY HELPER: check if user has any of multiple roles
-- ============================================================
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID, _roles app_role[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = ANY(_roles)
  )
$$;
