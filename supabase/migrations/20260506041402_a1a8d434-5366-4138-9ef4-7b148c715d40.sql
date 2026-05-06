REVOKE EXECUTE ON FUNCTION public.convert_lead_to_client(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.find_existing_client(text, text, text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.convert_lead_to_client(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.find_existing_client(text, text, text) TO authenticated;