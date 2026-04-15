import { supabase } from '@/integrations/supabase/client';

export async function logAudit(
  action: string,
  resource: string,
  targetType?: string,
  targetId?: string,
  metadata?: Record<string, unknown>
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('audit_log').insert([{
      action,
      resource,
      target_type: targetType || null,
      target_id: targetId || null,
      user_id: user?.id || null,
      metadata: (metadata || {}) as any,
      result: 'success',
    }]);
  } catch (e) {
    console.error('Audit log error:', e);
  }
}
