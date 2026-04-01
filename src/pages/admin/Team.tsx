import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_LABELS, type AppRole } from '@/lib/auth-types';
import { toast } from '@/hooks/use-toast';
import { Loader2, Shield, UserX, UserCheck } from 'lucide-react';

interface TeamMember {
  user_id: string;
  full_name: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  roles: AppRole[];
}

export default function Team() {
  const { roles: myRoles, user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<AppRole>('corretor');

  const isSuperAdmin = myRoles.includes('superadmin');

  useEffect(() => { loadTeam(); }, []);

  async function loadTeam() {
    setLoading(true);
    const { data: profiles } = await supabase.from('profiles').select('user_id, full_name, phone, is_active, created_at');
    const { data: allRoles } = await supabase.from('user_roles').select('user_id, role');

    const roleMap: Record<string, AppRole[]> = {};
    (allRoles || []).forEach((r: any) => {
      if (!roleMap[r.user_id]) roleMap[r.user_id] = [];
      roleMap[r.user_id].push(r.role);
    });

    const team: TeamMember[] = (profiles || []).map((p: any) => ({
      ...p,
      roles: roleMap[p.user_id] || [],
    }));

    setMembers(team.sort((a, b) => (b.roles.length - a.roles.length)));
    setLoading(false);
  }

  async function toggleActive(member: TeamMember) {
    const { error } = await supabase.from('profiles').update({ is_active: !member.is_active }).eq('user_id', member.user_id);
    if (error) toast({ title: 'Erro', variant: 'destructive' });
    else {
      toast({ title: member.is_active ? 'Usuário desativado' : 'Usuário ativado' });
      loadTeam();
    }
  }

  async function addRole() {
    if (!selectedMember) return;
    const url = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/manage-roles`;
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ action: 'assign-role', user_id: selectedMember.user_id, role: newRole }),
    });
    const result = await res.json();
    if (res.ok) {
      toast({ title: 'Perfil atribuído' });
      setDialogOpen(false);
      loadTeam();
    } else {
      toast({ title: 'Erro', description: result.error || 'Falha ao atribuir', variant: 'destructive' });
    }
  }

  async function removeRole(member: TeamMember, role: AppRole) {
    if (!confirm(`Remover perfil "${ROLE_LABELS[role]}" deste usuário?`)) return;
    const url = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/manage-roles`;
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ action: 'remove-role', user_id: member.user_id, role }),
    });
    if (res.ok) { toast({ title: 'Perfil removido' }); loadTeam(); }
    else toast({ title: 'Erro ao remover', variant: 'destructive' });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Equipe</h1>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : members.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">Nenhum membro encontrado</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Perfis</TableHead>
                    <TableHead className="hidden md:table-cell">Telefone</TableHead>
                    <TableHead>Status</TableHead>
                    {isSuperAdmin && <TableHead className="w-32">Ações</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((m) => (
                    <TableRow key={m.user_id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {(m.full_name || 'U').charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">{m.full_name || 'Sem nome'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {m.roles.map((r) => (
                            <Badge key={r} variant="outline" className="text-xs cursor-pointer" onClick={() => isSuperAdmin && removeRole(m, r)}>
                              {ROLE_LABELS[r] || r}
                            </Badge>
                          ))}
                          {m.roles.length === 0 && <span className="text-xs text-muted-foreground">Sem perfil</span>}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{m.phone || '—'}</TableCell>
                      <TableCell>
                        <Badge variant={m.is_active ? 'default' : 'secondary'} className="text-xs">
                          {m.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      {isSuperAdmin && (
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title="Gerenciar perfis"
                              onClick={() => { setSelectedMember(m); setDialogOpen(true); }}
                            >
                              <Shield className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title={m.is_active ? 'Desativar' : 'Ativar'}
                              onClick={() => toggleActive(m)}
                            >
                              {m.is_active ? <UserX className="h-4 w-4 text-destructive" /> : <UserCheck className="h-4 w-4 text-green-600" />}
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerenciar Perfis — {selectedMember?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground">Perfis atuais:</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedMember?.roles.map((r) => (
                  <Badge key={r} variant="outline">{ROLE_LABELS[r]}</Badge>
                ))}
                {selectedMember?.roles.length === 0 && <span className="text-xs text-muted-foreground">Nenhum</span>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Adicionar perfil</Label>
              <div className="flex gap-2">
                <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(ROLE_LABELS) as AppRole[]).map((r) => (
                      <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={addRole}>Adicionar</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
