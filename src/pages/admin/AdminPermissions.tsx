import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import InternalPageHeader from '@/components/shared/InternalPageHeader';
import { Loader2, KeyRound, Save, ShieldOff } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import EmptyState from '@/components/shared/EmptyState';

const ROLES = ['cliente', 'corretor_parceiro', 'corretor', 'locacao', 'vendas', 'financeiro', 'administrativo', 'superadmin'] as const;
const ROLE_LABELS: Record<string, string> = {
  cliente: 'Cliente', corretor_parceiro: 'Corretor Parceiro', corretor: 'Corretor',
  locacao: 'Locação', vendas: 'Vendas', financeiro: 'Financeiro',
  administrativo: 'Administrativo', superadmin: 'Superadmin',
};

interface Permission { code: string; module: string; action: string; description: string | null; }

export default function AdminPermissions() {
  const { roles } = useAuth();
  const isSuperadmin = roles.includes('superadmin');
  const [perms, setPerms] = useState<Permission[]>([]);
  const [matrix, setMatrix] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeRole, setActiveRole] = useState<string>('corretor');

  useEffect(() => { if (isSuperadmin) load(); else setLoading(false); }, [isSuperadmin]);

  async function load() {
    setLoading(true);
    const [pRes, rpRes] = await Promise.all([
      supabase.from('permissions' as any).select('code, module, action, description').order('module').order('action'),
      supabase.from('role_permissions' as any).select('role, permission_code'),
    ]);
    setPerms((pRes.data as any[]) || []);
    setMatrix(new Set(((rpRes.data as any[]) || []).map((r) => `${r.role}::${r.permission_code}`)));
    setLoading(false);
  }

  function toggle(role: string, code: string) {
    if (role === 'superadmin') return;
    const key = `${role}::${code}`;
    const next = new Set(matrix);
    if (next.has(key)) next.delete(key); else next.add(key);
    setMatrix(next);
  }

  async function save() {
    setSaving(true);
    try {
      const { data: existing } = await supabase.from('role_permissions' as any).select('role, permission_code');
      const existingSet = new Set(((existing as any[]) || []).map((r) => `${r.role}::${r.permission_code}`));
      const toAdd: any[] = [];
      const toRemove: { role: string; permission_code: string }[] = [];
      matrix.forEach((k) => { if (!existingSet.has(k)) { const [role, permission_code] = k.split('::'); toAdd.push({ role, permission_code }); } });
      existingSet.forEach((k) => { if (!matrix.has(k)) { const [role, permission_code] = k.split('::'); toRemove.push({ role, permission_code }); } });
      if (toAdd.length) { const { error } = await supabase.from('role_permissions' as any).insert(toAdd); if (error) throw error; }
      for (const r of toRemove) { await supabase.from('role_permissions' as any).delete().eq('role', r.role).eq('permission_code', r.permission_code); }
      toast.success(`Permissões atualizadas (${toAdd.length} adicionadas, ${toRemove.length} removidas)`);
    } catch (e: any) { toast.error(e.message || 'Erro ao salvar'); }
    setSaving(false);
  }

  if (!isSuperadmin) {
    return (
      <div>
        <InternalPageHeader title="Permissões" subtitle="Acesso restrito" />
        <EmptyState
          icon={ShieldOff}
          title="Acesso restrito"
          description="Apenas superadministradores podem visualizar e editar permissões."
        />
      </div>
    );
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const grouped: Record<string, Permission[]> = {};
  perms.forEach((p) => { (grouped[p.module] ||= []).push(p); });

  return (
    <div>
      <InternalPageHeader title="Permissões" subtitle="Matriz de perfis × permissões. Alterações são auditadas." />
      <div className="flex justify-end mb-4">
        <Button onClick={save} disabled={saving} className="min-h-11">
          <Save className="h-4 w-4 mr-2" />{saving ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </div>

      {/* MOBILE: Tabs por role + accordion por módulo */}
      <div className="lg:hidden">
        <Tabs value={activeRole} onValueChange={setActiveRole}>
          <div className="overflow-x-auto -mx-4 px-4 pb-2">
            <TabsList className="inline-flex w-auto">
              {ROLES.map((r) => (
                <TabsTrigger key={r} value={r} className="text-xs whitespace-nowrap">
                  {ROLE_LABELS[r]}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {ROLES.map((role) => (
            <TabsContent key={role} value={role} className="mt-3">
              {role === 'superadmin' && (
                <p className="text-xs text-muted-foreground mb-3 p-3 rounded-md bg-muted/40">
                  Superadmin sempre tem todas as permissões.
                </p>
              )}
              <Accordion type="multiple" defaultValue={Object.keys(grouped)}>
                {Object.entries(grouped).map(([mod, list]) => {
                  const checkedCount = list.filter((p) => matrix.has(`${role}::${p.code}`)).length;
                  return (
                    <AccordionItem key={mod} value={mod} className="border border-border rounded-lg mb-2 px-3">
                      <AccordionTrigger className="hover:no-underline py-3">
                        <div className="flex items-center justify-between w-full pr-2">
                          <span className="font-semibold uppercase text-xs">{mod}</span>
                          <span className="text-xs text-muted-foreground">
                            {checkedCount}/{list.length}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pb-2">
                          {list.map((p) => (
                            <label
                              key={p.code}
                              className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/40 cursor-pointer"
                            >
                              <Checkbox
                                checked={matrix.has(`${role}::${p.code}`)}
                                onCheckedChange={() => toggle(role, p.code)}
                                disabled={role === 'superadmin'}
                                className="mt-0.5"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-mono text-xs">{p.code}</div>
                                {p.description && (
                                  <div className="text-xs text-muted-foreground mt-0.5">{p.description}</div>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* DESKTOP: Matriz */}
      <div className="hidden lg:block bg-card border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-muted/50 sticky top-0">
            <tr>
              <th className="text-left px-3 py-2 font-medium">Permissão</th>
              {ROLES.map((r) => (<th key={r} className="px-2 py-2 font-medium text-center min-w-[80px]">{ROLE_LABELS[r]}</th>))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(grouped).map(([module, list]) => (
              <Fragment key={module}>
                <tr className="bg-muted/30"><td colSpan={ROLES.length + 1} className="px-3 py-1.5 font-semibold uppercase text-muted-foreground">{module}</td></tr>
                {list.map((p) => (
                  <tr key={p.code} className="border-b border-border hover:bg-muted/20">
                    <td className="px-3 py-2"><div className="font-mono text-xs">{p.code}</div>{p.description && <div className="text-muted-foreground text-xs">{p.description}</div>}</td>
                    {ROLES.map((r) => (
                      <td key={r} className="px-2 py-2 text-center">
                        <Checkbox checked={matrix.has(`${r}::${p.code}`)} onCheckedChange={() => toggle(r, p.code)} disabled={r === 'superadmin'} />
                      </td>
                    ))}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground mt-3 flex items-center gap-2">
        <KeyRound className="h-3 w-3" />
        Superadmin sempre tem todas as permissões e não pode ser alterado nesta interface.
      </p>
    </div>
  );
}
