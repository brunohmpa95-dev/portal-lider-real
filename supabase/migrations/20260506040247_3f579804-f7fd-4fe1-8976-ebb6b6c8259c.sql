CREATE OR REPLACE FUNCTION public.record_whatsapp_click(
  _intent text,
  _page text DEFAULT NULL,
  _url text DEFAULT NULL,
  _referrer text DEFAULT NULL,
  _utm_source text DEFAULT NULL,
  _utm_medium text DEFAULT NULL,
  _utm_campaign text DEFAULT NULL,
  _utm_term text DEFAULT NULL,
  _utm_content text DEFAULT NULL,
  _property_id uuid DEFAULT NULL,
  _property_code text DEFAULT NULL,
  _property_title text DEFAULT NULL,
  _neighborhood text DEFAULT NULL,
  _message_sent text DEFAULT NULL,
  _visitor_id text DEFAULT NULL,
  _metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _click_id uuid;
  _lead_id uuid;
  _settings public.whatsapp_settings;
  _intent_safe text := COALESCE(NULLIF(trim(_intent), ''), 'general');
  _lead_name text;
  _lead_email text;
  _lead_msg text;
BEGIN
  SELECT * INTO _settings FROM public.whatsapp_settings ORDER BY updated_at DESC LIMIT 1;

  INSERT INTO public.whatsapp_clicks(
    intent, page, url, referrer,
    utm_source, utm_medium, utm_campaign, utm_term, utm_content,
    property_id, property_code, property_title, neighborhood,
    message_sent, visitor_id, user_id, metadata
  ) VALUES (
    _intent_safe, _page, _url, _referrer,
    _utm_source, _utm_medium, _utm_campaign, _utm_term, _utm_content,
    _property_id, _property_code, _property_title, _neighborhood,
    _message_sent, _visitor_id, auth.uid(), COALESCE(_metadata, '{}'::jsonb)
  )
  RETURNING id INTO _click_id;

  -- Cria lead automático apenas se config existir e estiver ativa + flag auto_create_lead
  IF _settings.id IS NOT NULL AND _settings.is_active AND _settings.auto_create_lead THEN
    _lead_name := CASE
      WHEN _property_code IS NOT NULL THEN 'WhatsApp · ' || _property_code
      ELSE 'WhatsApp · visitante'
    END;
    _lead_email := 'wa+' || substr(_click_id::text, 1, 8) || '@anon.lider.local';
    _lead_msg := COALESCE(_message_sent, 'Clique no WhatsApp (' || _intent_safe || ')');

    INSERT INTO public.property_leads(
      name, email, source, channel, message,
      property_id, funnel_stage, status, temperature, priority
    ) VALUES (
      _lead_name, _lead_email, 'whatsapp', 'whatsapp', _lead_msg,
      _property_id, 'new', 'new', 'warm', 'normal'
    )
    RETURNING id INTO _lead_id;

    -- Vincula clique ao lead
    UPDATE public.whatsapp_clicks SET lead_id = _lead_id WHERE id = _click_id;

    -- Registra evento na timeline
    INSERT INTO public.lead_interactions(lead_id, user_id, interaction_type, content)
    VALUES (
      _lead_id,
      _lead_id, -- placeholder; user_id é NOT NULL e não há sessão para visitante
      'whatsapp',
      'Origem: clique no WhatsApp (' || _intent_safe || ')'
        || CASE WHEN _property_code IS NOT NULL THEN ' · imóvel ' || _property_code ELSE '' END
        || CASE WHEN _utm_source IS NOT NULL THEN ' · utm_source=' || _utm_source ELSE '' END
        || CASE WHEN _page IS NOT NULL THEN ' · página ' || _page ELSE '' END
    );
  END IF;

  RETURN jsonb_build_object('click_id', _click_id, 'lead_id', _lead_id);
END;
$$;

REVOKE ALL ON FUNCTION public.record_whatsapp_click(text,text,text,text,text,text,text,text,text,uuid,text,text,text,text,text,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_whatsapp_click(text,text,text,text,text,text,text,text,text,uuid,text,text,text,text,text,jsonb) TO anon, authenticated;