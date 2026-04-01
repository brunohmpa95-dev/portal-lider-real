
-- ================================================================
-- 1. REMOVE overly permissive INSERT policies from form tables
--    All form inserts now go through edge function with service_role
-- ================================================================

-- contact_messages
DROP POLICY IF EXISTS "contact_anon_insert" ON public.contact_messages;

-- listing_submissions  
DROP POLICY IF EXISTS "listing_sub_anon_insert" ON public.listing_submissions;

-- ombudsman_tickets
DROP POLICY IF EXISTS "ombudsman_anon_insert" ON public.ombudsman_tickets;

-- job_applications
DROP POLICY IF EXISTS "jobs_anon_insert" ON public.job_applications;

-- property_leads
DROP POLICY IF EXISTS "leads_anon_insert" ON public.property_leads;

-- ================================================================
-- 2. LOCK DOWN audit_log — only service_role can insert
-- ================================================================

DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.audit_log;

-- ================================================================
-- 3. FIX support_client_update — restrict columns clients can modify
--    Use a trigger to prevent clients from changing internal fields
-- ================================================================

DROP POLICY IF EXISTS "support_client_update" ON public.support_requests;

-- New restricted policy: clients can only update message and subject on their own tickets
CREATE POLICY "support_client_update_restricted"
ON public.support_requests
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND NOT is_admin(auth.uid()))
WITH CHECK (auth.uid() = user_id AND NOT is_admin(auth.uid()));

-- Trigger to enforce column-level restrictions for non-admin users
CREATE OR REPLACE FUNCTION public.restrict_support_client_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If user is admin or internal, allow all changes
  IF is_admin(auth.uid()) OR has_role(auth.uid(), 'locacao'::app_role) THEN
    RETURN NEW;
  END IF;

  -- For clients: revert any changes to internal-only fields
  NEW.internal_notes := OLD.internal_notes;
  NEW.assigned_to := OLD.assigned_to;
  NEW.priority := OLD.priority;
  NEW.status := OLD.status;
  NEW.resolved_at := OLD.resolved_at;
  NEW.category := OLD.category;
  NEW.user_id := OLD.user_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_restrict_support_client_update ON public.support_requests;
CREATE TRIGGER trg_restrict_support_client_update
BEFORE UPDATE ON public.support_requests
FOR EACH ROW
EXECUTE FUNCTION public.restrict_support_client_update();

-- ================================================================
-- 4. FIX STORAGE — scope anonymous uploads to 'anonymous/' prefix
-- ================================================================

-- Resumes: replace open anon upload with path-scoped
DROP POLICY IF EXISTS "resumes_anon_upload" ON storage.objects;
CREATE POLICY "resumes_scoped_anon_upload"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (
  bucket_id = 'resumes'
  AND (storage.foldername(name))[1] = 'anonymous'
);

-- Form attachments: replace open anon upload with path-scoped
DROP POLICY IF EXISTS "form_attach_anon_upload" ON storage.objects;
CREATE POLICY "form_attach_scoped_anon_upload"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (
  bucket_id = 'form-attachments'
  AND (storage.foldername(name))[1] = 'anonymous'
);

-- Ombudsman attachments: replace open anon upload with path-scoped
DROP POLICY IF EXISTS "ombudsman_attach_anon_upload" ON storage.objects;
CREATE POLICY "ombudsman_attach_scoped_anon_upload"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (
  bucket_id = 'ombudsman-attachments'
  AND (storage.foldername(name))[1] = 'anonymous'
);
