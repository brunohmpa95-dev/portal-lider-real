-- Allow anonymous and authenticated users to submit contact forms
CREATE POLICY "contact_public_insert"
ON public.contact_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow anonymous and authenticated users to submit ombudsman tickets
CREATE POLICY "ombudsman_public_insert"
ON public.ombudsman_tickets
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow anonymous and authenticated users to submit listing submissions
CREATE POLICY "listing_sub_public_insert"
ON public.listing_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow anonymous and authenticated users to submit job applications
CREATE POLICY "jobs_public_insert"
ON public.job_applications
FOR INSERT
TO anon, authenticated
WITH CHECK (true);