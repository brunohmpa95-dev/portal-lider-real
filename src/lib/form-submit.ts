import { supabase } from '@/integrations/supabase/client';

const FUNCTION_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/form-submit`;

export type FormType = 'contact' | 'listing' | 'ombudsman' | 'career' | 'property_lead' | 'support';

interface SubmitResult {
  success: boolean;
  message: string;
}

export async function submitForm(formType: FormType, data: Record<string, unknown>): Promise<SubmitResult> {
  const { data: { session } } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const res = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ form_type: formType, ...data }),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.error || 'Erro ao enviar formulário');
  }

  return result as SubmitResult;
}
