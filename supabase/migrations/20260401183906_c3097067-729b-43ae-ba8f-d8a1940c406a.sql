
-- 1. maintenance_requests
CREATE TABLE public.maintenance_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tipo text NOT NULL,
  descricao text NOT NULL,
  urgencia text NOT NULL DEFAULT 'media',
  status text NOT NULL DEFAULT 'aberta',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "maint_client_read" ON public.maintenance_requests FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "maint_client_insert" ON public.maintenance_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "maint_admin_read" ON public.maintenance_requests FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "maint_admin_update" ON public.maintenance_requests FOR UPDATE TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "maint_superadmin_delete" ON public.maintenance_requests FOR DELETE TO authenticated USING (has_role(auth.uid(), 'superadmin'::app_role));

CREATE TRIGGER update_maintenance_requests_updated_at BEFORE UPDATE ON public.maintenance_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. inspections
CREATE TABLE public.inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tipo text NOT NULL,
  data_preferencial date,
  observacoes text,
  status text NOT NULL DEFAULT 'agendada',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insp_client_read" ON public.inspections FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insp_client_insert" ON public.inspections FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "insp_admin_read" ON public.inspections FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "insp_admin_update" ON public.inspections FOR UPDATE TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "insp_superadmin_delete" ON public.inspections FOR DELETE TO authenticated USING (has_role(auth.uid(), 'superadmin'::app_role));

CREATE TRIGGER update_inspections_updated_at BEFORE UPDATE ON public.inspections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. rental_inquiries
CREATE TABLE public.rental_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  assunto text NOT NULL,
  mensagem text NOT NULL,
  status text NOT NULL DEFAULT 'nova',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.rental_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rental_client_read" ON public.rental_inquiries FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "rental_client_insert" ON public.rental_inquiries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rental_admin_read" ON public.rental_inquiries FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "rental_admin_update" ON public.rental_inquiries FOR UPDATE TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "rental_superadmin_delete" ON public.rental_inquiries FOR DELETE TO authenticated USING (has_role(auth.uid(), 'superadmin'::app_role));

CREATE TRIGGER update_rental_inquiries_updated_at BEFORE UPDATE ON public.rental_inquiries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. document_requests
CREATE TABLE public.document_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tipo_documento text NOT NULL,
  periodo text,
  justificativa text,
  status text NOT NULL DEFAULT 'pendente',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.document_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "docreq_client_read" ON public.document_requests FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "docreq_client_insert" ON public.document_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "docreq_admin_read" ON public.document_requests FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "docreq_admin_update" ON public.document_requests FOR UPDATE TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "docreq_superadmin_delete" ON public.document_requests FOR DELETE TO authenticated USING (has_role(auth.uid(), 'superadmin'::app_role));

CREATE TRIGGER update_document_requests_updated_at BEFORE UPDATE ON public.document_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. boletos
CREATE TABLE public.boletos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  mes integer NOT NULL,
  ano integer NOT NULL,
  valor numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pendente',
  link_boleto text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.boletos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "boletos_client_read" ON public.boletos FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "boletos_admin_read" ON public.boletos FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "boletos_admin_insert" ON public.boletos FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "boletos_admin_update" ON public.boletos FOR UPDATE TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "boletos_superadmin_delete" ON public.boletos FOR DELETE TO authenticated USING (has_role(auth.uid(), 'superadmin'::app_role));

-- 6. Storage bucket for document templates
INSERT INTO storage.buckets (id, name, public) VALUES ('documentos-modelos', 'documentos-modelos', false);

CREATE POLICY "docs_modelos_auth_read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'documentos-modelos');
CREATE POLICY "docs_modelos_admin_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documentos-modelos' AND is_admin(auth.uid()));
CREATE POLICY "docs_modelos_admin_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'documentos-modelos' AND is_admin(auth.uid()));
CREATE POLICY "docs_modelos_admin_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'documentos-modelos' AND is_admin(auth.uid()));
