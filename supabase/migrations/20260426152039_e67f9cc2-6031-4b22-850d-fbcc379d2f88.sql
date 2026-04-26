
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS archived_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS archived_by uuid NULL,
  ADD COLUMN IF NOT EXISTS archived_reason text NULL;

CREATE INDEX IF NOT EXISTS idx_properties_archived_at ON public.properties (archived_at);

-- Replace public read policy to hide archived properties from the public site
DROP POLICY IF EXISTS properties_public_read ON public.properties;
CREATE POLICY properties_public_read
  ON public.properties
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published' AND archived_at IS NULL);
