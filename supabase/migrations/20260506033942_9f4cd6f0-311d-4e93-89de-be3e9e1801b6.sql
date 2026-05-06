ALTER TABLE public.property_leads
  ADD COLUMN IF NOT EXISTS whatsapp text,
  ADD COLUMN IF NOT EXISTS channel text,
  ADD COLUMN IF NOT EXISTS temperature text NOT NULL DEFAULT 'cold',
  ADD COLUMN IF NOT EXISTS client_id uuid;

CREATE INDEX IF NOT EXISTS idx_leads_temperature ON public.property_leads(temperature);
CREATE INDEX IF NOT EXISTS idx_leads_assigned    ON public.property_leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_property    ON public.property_leads(property_id);
CREATE INDEX IF NOT EXISTS idx_leads_funnel      ON public.property_leads(funnel_stage);
CREATE INDEX IF NOT EXISTS idx_leads_client      ON public.property_leads(client_id);