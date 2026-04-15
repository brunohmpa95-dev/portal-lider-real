import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import PageHead from '@/components/shared/PageHead';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import PropertyCard from '@/components/property/PropertyCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useProperties } from '@/hooks/useProperties';
import { NEIGHBORHOODS, PROPERTY_TYPES, BEDROOM_OPTIONS } from '@/data/constants';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface PropertyListingPageProps {
  purpose: 'sale' | 'rent';
}

const PAGE_SIZE = 12;

const PropertyListingPage = ({ purpose }: PropertyListingPageProps) => {
  const [searchParams] = useSearchParams();
  const label = purpose === 'sale' ? 'Comprar' : 'Alugar';

  const [type, setType] = useState(searchParams.get('tipo') || '');
  const [neighborhood, setNeighborhood] = useState(searchParams.get('bairro') || '');
  const [bedrooms, setBedrooms] = useState(searchParams.get('quartos') || '');
  const [priceMin, setPriceMin] = useState(searchParams.get('valorMin') || '');
  const [priceMax, setPriceMax] = useState(searchParams.get('valorMax') || '');
  const [code, setCode] = useState(searchParams.get('codigo') || '');
  const [sortBy, setSortBy] = useState<'recent' | 'price-asc' | 'price-desc'>('recent');
  const [page, setPage] = useState(0);

  const filters = useMemo(() => ({
    purpose, type, neighborhood, bedrooms, priceMin, priceMax, code, sortBy,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  }), [purpose, type, neighborhood, bedrooms, priceMin, priceMax, code, sortBy, page]);

  const { data, isLoading, isError } = useProperties(filters);
  const results = data?.properties || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const selectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  const resetFilters = () => {
    setType(''); setNeighborhood(''); setBedrooms(''); setPriceMin(''); setPriceMax(''); setCode('');
    setPage(0);
  };

  return (
    <Layout>
      <PageHead
        title={label}
        description={`Imóveis para ${label.toLowerCase()} em Itaúna - MG. Encontre casas, apartamentos, terrenos e mais com a Líder Imóveis.`}
      />
      <div className="container mx-auto px-4">
        <Breadcrumbs items={[{ label }]} />

        <h1 className="text-3xl font-sans font-bold text-foreground mb-6">
          Imóveis para {label}
        </h1>

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-5 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            <select value={type} onChange={e => { setType(e.target.value); setPage(0); }} className={selectClass} aria-label="Tipo">
              <option value="">Todos os tipos</option>
              {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <select value={neighborhood} onChange={e => { setNeighborhood(e.target.value); setPage(0); }} className={selectClass} aria-label="Bairro">
              <option value="">Todos os bairros</option>
              {NEIGHBORHOODS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <select value={bedrooms} onChange={e => { setBedrooms(e.target.value); setPage(0); }} className={selectClass} aria-label="Quartos">
              <option value="">Quartos</option>
              {BEDROOM_OPTIONS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
            <Input placeholder="Código" value={code} onChange={e => { setCode(e.target.value); setPage(0); }} aria-label="Código" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input placeholder="Valor mínimo" type="number" value={priceMin} onChange={e => { setPriceMin(e.target.value); setPage(0); }} />
            <Input placeholder="Valor máximo" type="number" value={priceMax} onChange={e => { setPriceMax(e.target.value); setPage(0); }} />
            <select value={sortBy} onChange={e => { setSortBy(e.target.value as any); setPage(0); }} className={selectClass} aria-label="Ordenar">
              <option value="recent">Mais recentes</option>
              <option value="price-asc">Menor preço</option>
              <option value="price-desc">Maior preço</option>
            </select>
          </div>
        </div>

        {/* Results */}
        <p className="text-sm text-muted-foreground mb-6">
          {isLoading ? 'Buscando...' : `${totalCount} ${totalCount === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}`}
        </p>

        {isError && (
          <div className="text-center py-20">
            <p className="text-destructive font-medium mb-2">Erro ao carregar imóveis</p>
            <p className="text-muted-foreground text-sm">Tente novamente em alguns instantes.</p>
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-border overflow-hidden">
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && !isError && results.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {results.map((p, i) => <PropertyCard key={p.id} property={p} index={i} />)}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mb-12">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {page + 1} de {totalPages}
                </span>
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}

        {!isLoading && !isError && results.length === 0 && (
          <div className="text-center py-20">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-sans text-lg font-semibold text-foreground mb-2">Nenhum imóvel encontrado</h3>
            <p className="text-muted-foreground text-sm mb-4">Tente ajustar os filtros para encontrar mais resultados.</p>
            <Button variant="outline" onClick={resetFilters}>Limpar filtros</Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PropertyListingPage;
