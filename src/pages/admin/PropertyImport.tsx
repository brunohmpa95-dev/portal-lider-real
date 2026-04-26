import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  ArrowLeft, Upload, Download, FileText, Loader2, CheckCircle2, AlertTriangle, ArrowRight,
} from 'lucide-react';
import { PROPERTY_TYPE_OPTIONS, PROPERTY_PURPOSE_OPTIONS } from '@/types/admin';
import { toast } from '@/hooks/use-toast';
import { logAudit } from '@/lib/audit';

const TARGET_FIELDS = [
  { key: 'code', label: 'Código *', required: true },
  { key: 'title', label: 'Título *', required: true },
  { key: 'type', label: 'Tipo (casa/apartamento/...) *', required: true },
  { key: 'purpose', label: 'Finalidade (sale/rent) *', required: true },
  { key: 'price', label: 'Preço *', required: true },
  { key: 'neighborhood', label: 'Bairro' },
  { key: 'city', label: 'Cidade' },
  { key: 'state', label: 'Estado' },
  { key: 'address', label: 'Endereço' },
  { key: 'bedrooms', label: 'Quartos' },
  { key: 'suites', label: 'Suítes' },
  { key: 'bathrooms', label: 'Banheiros' },
  { key: 'parking_spots', label: 'Vagas' },
  { key: 'area', label: 'Área (m²)' },
  { key: 'description', label: 'Descrição' },
  { key: 'condominium_fee', label: 'Condomínio' },
  { key: 'iptu', label: 'IPTU' },
] as const;

type FieldKey = typeof TARGET_FIELDS[number]['key'];
const REQUIRED: FieldKey[] = ['code', 'title', 'type', 'purpose', 'price'];
const NUMERIC: FieldKey[] = ['price', 'area', 'bedrooms', 'suites', 'bathrooms', 'parking_spots', 'condominium_fee', 'iptu'];
const VALID_TYPES = PROPERTY_TYPE_OPTIONS.map((o) => o.value);
const VALID_PURPOSES = PROPERTY_PURPOSE_OPTIONS.map((o) => o.value);

type Step = 1 | 2 | 3 | 4;

interface RowError { row: number; field: string; message: string; }

function suggestMapping(header: string): FieldKey | '' {
  const h = header.trim().toLowerCase();
  const map: Record<string, FieldKey> = {
    'codigo': 'code', 'código': 'code', 'code': 'code', 'ref': 'code',
    'titulo': 'title', 'título': 'title', 'title': 'title', 'nome': 'title',
    'tipo': 'type', 'type': 'type',
    'finalidade': 'purpose', 'purpose': 'purpose', 'operacao': 'purpose', 'operação': 'purpose',
    'preco': 'price', 'preço': 'price', 'price': 'price', 'valor': 'price',
    'bairro': 'neighborhood', 'neighborhood': 'neighborhood',
    'cidade': 'city', 'city': 'city',
    'estado': 'state', 'state': 'state', 'uf': 'state',
    'endereco': 'address', 'endereço': 'address', 'address': 'address',
    'quartos': 'bedrooms', 'dormitorios': 'bedrooms', 'dormitórios': 'bedrooms', 'bedrooms': 'bedrooms',
    'suites': 'suites', 'suítes': 'suites',
    'banheiros': 'bathrooms', 'bathrooms': 'bathrooms', 'wc': 'bathrooms',
    'vagas': 'parking_spots', 'garagem': 'parking_spots', 'parking_spots': 'parking_spots',
    'area': 'area', 'área': 'area', 'm2': 'area', 'metragem': 'area',
    'descricao': 'description', 'descrição': 'description', 'description': 'description',
    'condominio': 'condominium_fee', 'condomínio': 'condominium_fee', 'condominium_fee': 'condominium_fee',
    'iptu': 'iptu',
  };
  return map[h] || '';
}

function parseNumber(v: any): number | null {
  if (v === null || v === undefined || v === '') return null;
  const s = String(v).replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export default function PropertyImport() {
  const { user, roles } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>(1);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [mapping, setMapping] = useState<Record<string, FieldKey | ''>>({});
  const [skipInvalid, setSkipInvalid] = useState(true);
  const [defaultStatus, setDefaultStatus] = useState<'draft' | 'published'>('draft');
  const [progress, setProgress] = useState(0);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ created: number; failed: number; errors: string[] } | null>(null);

  const isAdmin = roles.some((r) => ['administrativo', 'superadmin'].includes(r));
  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Acesso restrito a administradores.</p>
        <Button asChild variant="link"><Link to="/admin/properties">Voltar</Link></Button>
      </div>
    );
  }

  function handleFile(file: File) {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        if (res.errors?.length) {
          toast({ title: 'Erro ao ler CSV', description: res.errors[0].message, variant: 'destructive' });
          return;
        }
        const data = (res.data as Record<string, any>[]).filter((r) => Object.values(r).some((v) => v !== ''));
        if (data.length === 0) {
          toast({ title: 'CSV vazio', variant: 'destructive' });
          return;
        }
        if (data.length > 2000) {
          toast({ title: 'Limite excedido', description: 'Máximo de 2000 linhas por importação.', variant: 'destructive' });
          return;
        }
        const hdrs = (res.meta.fields || []).filter(Boolean);
        setHeaders(hdrs);
        setRows(data);
        const auto: Record<string, FieldKey | ''> = {};
        hdrs.forEach((h) => { auto[h] = suggestMapping(h); });
        setMapping(auto);
        setStep(2);
      },
      error: (err) => toast({ title: 'Erro ao ler CSV', description: err.message, variant: 'destructive' }),
    });
  }

  const mappedFields = useMemo(() => Object.values(mapping).filter(Boolean) as FieldKey[], [mapping]);
  const missingRequired = REQUIRED.filter((r) => !mappedFields.includes(r));

  const validation = useMemo(() => {
    if (step < 3) return { errors: [] as RowError[], validRows: [] as any[], existingCodes: [] as string[] };
    const errors: RowError[] = [];
    const validRows: any[] = [];
    const codes: string[] = [];
    rows.forEach((row, idx) => {
      const obj: Record<string, any> = {};
      let rowOk = true;
      Object.entries(mapping).forEach(([csvCol, field]) => {
        if (!field) return;
        const raw = row[csvCol];
        if (NUMERIC.includes(field)) {
          const n = parseNumber(raw);
          if (REQUIRED.includes(field) && n === null) {
            errors.push({ row: idx + 2, field, message: `valor numérico inválido (${raw})` });
            rowOk = false;
          }
          obj[field] = n ?? 0;
        } else {
          obj[field] = raw ? String(raw).trim() : null;
        }
      });
      if (REQUIRED.includes('code') && !obj.code) { errors.push({ row: idx + 2, field: 'code', message: 'obrigatório' }); rowOk = false; }
      if (REQUIRED.includes('title') && !obj.title) { errors.push({ row: idx + 2, field: 'title', message: 'obrigatório' }); rowOk = false; }
      if (obj.type && !VALID_TYPES.includes(obj.type)) {
        errors.push({ row: idx + 2, field: 'type', message: `inválido (use: ${VALID_TYPES.join(', ')})` }); rowOk = false;
      }
      if (obj.purpose && !VALID_PURPOSES.includes(obj.purpose)) {
        errors.push({ row: idx + 2, field: 'purpose', message: `use sale ou rent` }); rowOk = false;
      }
      if (obj.code) codes.push(obj.code);
      if (rowOk) validRows.push(obj);
    });
    return { errors, validRows, existingCodes: codes };
  }, [step, rows, mapping]);

  const [duplicateCodes, setDuplicateCodes] = useState<string[]>([]);
  async function checkDuplicateCodes() {
    if (validation.existingCodes.length === 0) return;
    const { data } = await supabase.from('properties').select('code').in('code', validation.existingCodes);
    setDuplicateCodes((data || []).map((d: any) => d.code));
  }

  async function goToValidation() {
    if (missingRequired.length > 0) {
      toast({ title: 'Mapeamento incompleto', description: `Falta mapear: ${missingRequired.join(', ')}`, variant: 'destructive' });
      return;
    }
    setStep(3);
    setTimeout(checkDuplicateCodes, 50);
  }

  async function performImport() {
    setImporting(true);
    setResult(null);
    let toImport = validation.validRows.filter((r) => !duplicateCodes.includes(r.code));
    if (!skipInvalid && validation.errors.length > 0) {
      toast({ title: 'Existem erros', description: 'Corrija ou marque "ignorar inválidas".', variant: 'destructive' });
      setImporting(false);
      return;
    }
    const errs: string[] = [];
    let created = 0;
    const chunks = [];
    for (let i = 0; i < toImport.length; i += 100) chunks.push(toImport.slice(i, i + 100));
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i].map((r) => ({
        ...r,
        status: defaultStatus,
        created_by: user?.id || null,
        city: r.city || 'Itaúna',
        state: r.state || 'MG',
      }));
      const { error, data } = await supabase.from('properties').insert(chunk).select('id');
      if (error) errs.push(`Lote ${i + 1}: ${error.message}`);
      else created += data?.length || 0;
      setProgress(Math.round(((i + 1) / chunks.length) * 100));
    }
    await logAudit('property.import', 'properties', 'property', 'bulk', {
      created, failed: toImport.length - created, skipped_duplicates: duplicateCodes.length,
    });
    setResult({ created, failed: toImport.length - created, errors: errs });
    setImporting(false);
    setStep(4);
  }

  function downloadTemplate() {
    const headers = TARGET_FIELDS.map((f) => f.key).join(',');
    const example = 'AP001,Apartamento exemplo Centro,apartamento,sale,350000,Centro,Itaúna,MG,Rua Exemplo 100,2,1,2,1,75,Descrição opcional,250,80';
    const csv = `${headers}\n${example}\n`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'modelo-imoveis.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  function downloadErrorReport() {
    const csv = ['linha,campo,erro', ...validation.errors.map((e) => `${e.row},${e.field},"${e.message}"`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'erros-importacao.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm"><Link to="/admin/properties"><ArrowLeft className="h-4 w-4 mr-1" /> Voltar</Link></Button>
        <h1 className="text-2xl font-bold">Importar imóveis (CSV)</h1>
      </div>

      <div className="flex gap-2 text-xs">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className={`flex-1 h-1.5 rounded-full ${step >= n ? 'bg-primary' : 'bg-muted'}`} />
        ))}
      </div>

      {step === 1 && (
        <Card>
          <CardHeader><CardTitle>1. Selecione o arquivo CSV</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-3">Arquivo .csv com até 2000 linhas e 5 MB</p>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              <Button onClick={() => fileRef.current?.click()}>
                <Upload className="h-4 w-4 mr-1" /> Escolher arquivo
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-1" /> Baixar CSV modelo
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>2. Mapeie as colunas</CardTitle>
            <p className="text-sm text-muted-foreground">{rows.length} linhas detectadas. Campos obrigatórios marcados com *.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {headers.map((h) => (
                <div key={h} className="grid grid-cols-2 gap-3 items-center">
                  <div className="text-sm font-mono truncate">{h}</div>
                  <Select value={mapping[h] || '__none__'} onValueChange={(v) => setMapping((m) => ({ ...m, [h]: v === '__none__' ? '' : v as FieldKey }))}>
                    <SelectTrigger><SelectValue placeholder="Ignorar" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— Ignorar —</SelectItem>
                      {TARGET_FIELDS.map((f) => (
                        <SelectItem key={f.key} value={f.key}
                          disabled={mappedFields.includes(f.key) && mapping[h] !== f.key}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            {missingRequired.length > 0 && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" /> Falta mapear: {missingRequired.join(', ')}
              </p>
            )}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>Voltar</Button>
              <Button onClick={goToValidation} disabled={missingRequired.length > 0}>
                Validar dados <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>3. Validação</CardTitle>
            <p className="text-sm text-muted-foreground">
              {validation.validRows.length} linhas válidas · {validation.errors.length} erros · {duplicateCodes.length} códigos já existentes (serão ignorados)
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {validation.errors.length > 0 && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-destructive">{validation.errors.length} erros encontrados</p>
                  <Button size="sm" variant="outline" onClick={downloadErrorReport}>
                    <Download className="h-4 w-4 mr-1" /> Baixar relatório
                  </Button>
                </div>
                <ul className="text-xs space-y-1 max-h-40 overflow-y-auto">
                  {validation.errors.slice(0, 20).map((e, i) => (
                    <li key={i}>Linha {e.row} · {e.field}: {e.message}</li>
                  ))}
                  {validation.errors.length > 20 && <li className="text-muted-foreground">... e mais {validation.errors.length - 20}</li>}
                </ul>
              </div>
            )}

            <div className="overflow-x-auto border rounded-md max-h-80">
              <Table>
                <TableHeader>
                  <TableRow>
                    {mappedFields.map((f) => <TableHead key={f}>{f}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validation.validRows.slice(0, 20).map((r, i) => (
                    <TableRow key={i}>
                      {mappedFields.map((f) => <TableCell key={f} className="text-xs">{String(r[f] ?? '')}</TableCell>)}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2">
                <Checkbox checked={skipInvalid} onCheckedChange={(v) => setSkipInvalid(!!v)} id="skip" />
                <label htmlFor="skip" className="text-sm">Ignorar linhas inválidas e prosseguir</label>
              </div>
              <Select value={defaultStatus} onValueChange={(v) => setDefaultStatus(v as any)}>
                <SelectTrigger className="w-full sm:w-56"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Importar como rascunho</SelectItem>
                  <SelectItem value="published">Importar como publicado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>Voltar</Button>
              <Button onClick={performImport}
                disabled={importing || validation.validRows.length - duplicateCodes.length === 0
                  || (!skipInvalid && validation.errors.length > 0)}>
                {importing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
                Importar {validation.validRows.length - duplicateCodes.length} imóveis
              </Button>
            </div>
            {importing && <Progress value={progress} />}
          </CardContent>
        </Card>
      )}

      {step === 4 && result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" /> Importação concluída
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm"><strong>{result.created}</strong> imóveis criados.</p>
            {result.failed > 0 && <p className="text-sm text-destructive">{result.failed} falharam.</p>}
            {result.errors.length > 0 && (
              <ul className="text-xs text-destructive space-y-1">
                {result.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            )}
            <div className="flex gap-2">
              <Button onClick={() => navigate('/admin/properties')}>Ver imóveis</Button>
              <Button variant="outline" onClick={() => { setStep(1); setRows([]); setHeaders([]); setMapping({}); setResult(null); setProgress(0); }}>
                Importar outro CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
