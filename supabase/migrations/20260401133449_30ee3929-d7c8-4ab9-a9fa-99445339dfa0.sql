
-- ============================================================
-- 1. NEW PRIVATE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('ombudsman-attachments', 'ombudsman-attachments', false, 10485760, 
   ARRAY['application/pdf','image/jpeg','image/png','image/webp','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('contract-documents', 'contract-documents', false, 10485760,
   ARRAY['application/pdf','image/jpeg','image/png','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('form-attachments', 'form-attachments', false, 10485760,
   ARRAY['application/pdf','image/jpeg','image/png','image/webp','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('internal-documents', 'internal-documents', false, 10485760,
   ARRAY['application/pdf','image/jpeg','image/png','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.ms-excel']);

-- Update existing buckets with file size limits and MIME restrictions
UPDATE storage.buckets SET 
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']
WHERE id = 'resumes';

UPDATE storage.buckets SET 
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf','image/jpeg','image/png','image/webp','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']
WHERE id = 'customer-documents';

UPDATE storage.buckets SET 
  file_size_limit = 20971520,
  allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp']
WHERE id = 'property-images';

-- ============================================================
-- 2. OMBUDSMAN ATTACHMENTS — anonymous insert, admin only read
-- ============================================================
CREATE POLICY "ombudsman_attach_anon_upload"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'ombudsman-attachments');

CREATE POLICY "ombudsman_attach_admin_read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'ombudsman-attachments' AND public.is_admin(auth.uid()));

CREATE POLICY "ombudsman_attach_admin_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'ombudsman-attachments' AND public.is_admin(auth.uid()));

-- ============================================================
-- 3. CONTRACT DOCUMENTS — client reads own folder, internal read all
-- ============================================================
CREATE POLICY "contract_docs_client_read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'contract-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "contract_docs_internal_read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'contract-documents' AND (
    public.has_role(auth.uid(), 'locacao') OR
    public.has_role(auth.uid(), 'vendas') OR
    public.is_admin(auth.uid())
  ));

CREATE POLICY "contract_docs_admin_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'contract-documents' AND public.is_admin(auth.uid()));

CREATE POLICY "contract_docs_admin_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'contract-documents' AND public.is_admin(auth.uid()));

-- ============================================================
-- 4. FORM ATTACHMENTS — anonymous insert, admin only read
-- ============================================================
CREATE POLICY "form_attach_anon_upload"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'form-attachments');

CREATE POLICY "form_attach_admin_read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'form-attachments' AND public.is_admin(auth.uid()));

CREATE POLICY "form_attach_admin_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'form-attachments' AND public.is_admin(auth.uid()));

-- ============================================================
-- 5. INTERNAL DOCUMENTS — internal team only
-- ============================================================
CREATE POLICY "internal_docs_team_read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'internal-documents' AND (
    public.has_any_role(auth.uid(), ARRAY['corretor','locacao','vendas','financeiro','administrativo','superadmin']::public.app_role[])
  ));

CREATE POLICY "internal_docs_admin_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'internal-documents' AND public.is_admin(auth.uid()));

CREATE POLICY "internal_docs_admin_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'internal-documents' AND public.is_admin(auth.uid()));

-- ============================================================
-- 6. FIX EXISTING: add missing policies
-- ============================================================
-- Resumes: admin delete
CREATE POLICY "resumes_admin_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'resumes' AND public.is_admin(auth.uid()));

-- Customer documents: admin update
CREATE POLICY "customer_docs_admin_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'customer-documents' AND public.is_admin(auth.uid()));
