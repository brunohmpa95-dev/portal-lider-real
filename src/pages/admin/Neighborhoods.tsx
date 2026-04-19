import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNeighborhoods, type Neighborhood } from '@/hooks/useNeighborhoods';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Plus, Pencil, Loader2, MapPin, Search } from 'lucide-react';

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalize(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

interface FormState {
  id?: string;
  name: string;
  region: string;
  is_active: boolean;
  verified: boolean;
}

const empty: FormState = { name: '', region: '', is_active: true, verified: false };

export default function AdminNeighborhoods() {
  const { data: neighborhoods, isLoading } = useNeighborhoods({ includeAll: true });
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);

  const filtered = (neighborhoods ?? []).filter((n) =>
    !search || n.normalized.includes(normalize(search))
  );

  const totalActive = (neighborhoods ?? []).filter((n) => n.is_active).length;
  const totalVerified = (neighborhoods ?? []).filter((n) => n.verified).length;
  const totalPending = (neighborhoods ?? []).filter((n) => !n.verified).length;

  function openNew() {
    setForm(empty);
    setOpen(true);
  }

  function openEdit(n: Neighborhood) {
    setForm({ id: n.id, name: n.name, region: n.region ?? '', is_active: n.is_active, verified: n.verified });
    setOpen(true);
  }

  async function save() {
    if (!form.name.trim()) {
      toast({ title: 'Nome obrigatório', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      slug: slugify(form.name),
      normalized: normalize(form.name),
      region: form.region.trim() || null,
      is_active: form.is_active,
      verified: form.verified,
    };
    const { error } = form.id
      ? await supabase.from('neighborhoods').update(payload).eq('id', form.id)
      : await supabase.from('neighborhoods').insert({ ...payload, source: 'admin-manual' });
    setSaving(false);
    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: form.id ? 'Bairro atualizado' : 'Bairro criado' });
    setOpen(false);
    qc.invalidateQueries({ queryKey: ['neighborhoods'] });
  }

  async function toggleActive(n: Neighborhood) {
    const { error } = await supabase
      .from('neighborhoods')
      .update({ is_active: !n.is_active })
      .eq('id', n.id);
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      return;
    }
    qc.invalidateQueries({ queryKey: ['neighborhoods'] });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            Bairros de Itaúna
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Base de bairros válidos para imóveis, filtros e SEO.
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-1" /> Novo bairro
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground">Ativos</div><div className="text-2xl font-bold">{totalActive}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground">Verificados</div><div className="text-2xl font-bold text-primary">{totalVerified}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground">Pendentes de revisão</div><div className="text-2xl font-bold text-destructive">{totalPending}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4" />
            Lista
          </CardTitle>
          <div className="pt-2">
            <Input
              placeholder="Buscar bairro…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Região</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead className="w-24">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((n) => (
                    <TableRow key={n.id}>
                      <TableCell className="font-medium">{n.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">{n.slug}</TableCell>
                      <TableCell className="text-sm">{n.region ?? '—'}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {n.verified ? (
                            <Badge variant="default" className="text-[10px]">Verificado</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] border-destructive text-destructive">Não verificado</Badge>
                          )}
                          {n.is_active ? (
                            <Badge variant="secondary" className="text-[10px]">Ativo</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px]">Inativo</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{n.source ?? '—'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openEdit(n)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Switch checked={n.is_active} onCheckedChange={() => toggleActive(n)} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhum bairro encontrado.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? 'Editar bairro' : 'Novo bairro'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Nome *</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ex: Santa Edwiges" />
              {form.name && (
                <p className="text-[11px] text-muted-foreground">Slug: <code>{slugify(form.name)}</code></p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Região (opcional)</Label>
              <Input value={form.region} onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))} placeholder="Ex: Central, Norte…" />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Switch checked={form.verified} onCheckedChange={(v) => setForm((f) => ({ ...f, verified: v }))} />
              <Label className="text-sm">Verificado oficialmente</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))} />
              <Label className="text-sm">Ativo (aparece em filtros e formulários)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
