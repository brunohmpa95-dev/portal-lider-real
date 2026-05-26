ALTER TABLE public.properties DROP CONSTRAINT properties_status_check;
ALTER TABLE public.properties ADD CONSTRAINT properties_status_check
  CHECK (status = ANY (ARRAY[
    'draft','published','archived','sold','rented',
    'captacao','aguardando_documentacao','reserved','em_proposta','paused'
  ]));