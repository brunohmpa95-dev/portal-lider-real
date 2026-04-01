
-- Add columns to audit_log for richer tracking
ALTER TABLE public.audit_log
  ADD COLUMN IF NOT EXISTS user_agent TEXT,
  ADD COLUMN IF NOT EXISTS result TEXT DEFAULT 'success',
  ADD COLUMN IF NOT EXISTS resource TEXT;

-- Rename target_type/target_id usage is already present but let's add useful indexes
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource ON public.audit_log(resource);
