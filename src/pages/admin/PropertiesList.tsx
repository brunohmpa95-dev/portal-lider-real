import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Eye, Edit, Trash2, Loader2, Star } from 'lucide-react';
import { PROPERTY_STATUS_OPTIONS, PROPERTY_TYPE_OPTIONS, PROPERTY_PURPOSE_OPTIONS } from '@/types/admin';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export default function PropertiesList() {
  const { roles } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterPurpose, setFilterPurpose] = useState('all');

  const isAdmin = roles.some((r) => ['administrativo', 'superadmin'].includes(r));
  const canEdit = roles.some((r) => ['corretor', 'vendas', 'administrativo', 'superadmin'].includes(r));

  useEffect(() => { loadProperties(); }, []);

  async function loadProperties() {
    setLoading(true);
    const { data } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
    setProperties(data || []);
    setLoading(false);
  }

  async function deleteProperty(id: string) {
    if (!confirm('Excluir este imóvel?')) return;
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Imóvel excluído' }); setProperties((p) => p.filter((x) => x.id !== id)); }
  }

  async function toggleStatus(id: string, current: string) {
    const next = current === 'published' ? 'paused' : 'published';
    const { error } = await supabase.from('properties').update({ status: next }).eq('id', id);
    if (!error) setProperties((p) => p.map((x) => x.id === id ? { ...x, status: next } : x));
  }

  const filtered = properties.filter((p) => {
    if (search) {
      const s = search.toLowerCase();
      if (!p.title?.toLowerCase().includes(s) && !p.code?.toLowerCase().includes(s) && !p.neighborhood?.toLowerCase().includes(s)) return false;
    }
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (filterType !== 'all' && p.type !== filterType) return false;
    if (filterPurpose !== 'all' && p.purpose !== filterPurpose) return false;
    return true;
  });

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = {
      published: 'bg-green-100 text-green-700', draft: 'bg-gray-100 text-gray-600',
      reserved: 'bg-blue-100 text-blue-700', sold: 'bg-purple-100 text-purple-700',
      rented: 'bg-indigo-100 text-indigo-700', paused: 'bg-amber-100 text-amber-700',
    };
    return colors[s] || 'bg-muted text-muted-foreground';
  };

  const formatPrice = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Imóveis</h1>
        {canEdit && (
          <Button asChild size="sm">
            <Link to="/admin/properties/new"><Plus className="h-4 w-4 mr-1" /> Novo Imóvel</Link>
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por título, código ou bairro..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos status</SelectItem>
                {PROPERTY_STATUS_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos tipos</SelectItem>
                {PROPERTY_TYPE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterPurpose} onValueChange={setFilterPurpose}>
              <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Finalidade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {PROPERTY_PURPOSE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">Nenhum imóvel encontrado</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead className="hidden md:table-cell">Tipo</TableHead>
                    <TableHead className="hidden sm:table-cell">Preço</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Bairro</TableHead>
                    <TableHead className="w-28">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">{p.code}</TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {p.is_featured && <Star className="h-3 w-3 inline mr-1 text-amber-500" />}
                        {p.title}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-xs capitalize">{p.type}</TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">{formatPrice(p.price)}</TableCell>
                      <TableCell>
                        <button onClick={() => canEdit && toggleStatus(p.id, p.status)} className="cursor-pointer">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge(p.status)}`}>
                            {PROPERTY_STATUS_OPTIONS.find((o) => o.value === p.status)?.label || p.status}
                          </span>
                        </button>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground text-xs">{p.neighborhood || '—'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/admin/properties/${p.id}`)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canEdit && (
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/admin/properties/${p.id}/edit`)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {isAdmin && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteProperty(p.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
