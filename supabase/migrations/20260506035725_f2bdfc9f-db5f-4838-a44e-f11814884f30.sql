ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS appointment_type text;

CREATE INDEX IF NOT EXISTS idx_tasks_appointment_due
  ON public.tasks(due_at)
  WHERE appointment_type IS NOT NULL AND status = 'pending';

COMMENT ON COLUMN public.tasks.appointment_type IS 'Tipo de compromisso para integração com agenda: visit | meeting | call | whatsapp | followup. NULL = tarefa comum.';