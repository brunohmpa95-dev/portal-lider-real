import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NEIGHBORHOODS, PROPERTY_TYPES, BEDROOM_OPTIONS } from '@/data/constants';
import { useIsMobile } from '@/hooks/use-mobile';

const SearchBar = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [purpose, setPurpose] = useState<'sale' | 'rent'>('sale');
  const [type, setType] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [code, setCode] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (type) params.set('tipo', type);
    if (neighborhood) params.set('bairro', neighborhood);
    if (bedrooms) params.set('quartos', bedrooms);
    if (priceMin) params.set('valorMin', priceMin);
    if (priceMax) params.set('valorMax', priceMax);
    if (code) params.set('codigo', code);
    navigate(`/${purpose === 'sale' ? 'comprar' : 'alugar'}?${params.toString()}`);
  };

  const selectClass = "flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  const hasActiveFilters = !!(priceMin || priceMax || code);

  return (
    <div className="bg-card rounded-xl border border-border p-4 sm:p-6 shadow-lg w-full max-w-4xl mx-auto">
      {/* Purpose toggle */}
      <div className="flex mb-4 bg-secondary rounded-lg p-1">
        <button
          onClick={() => setPurpose('sale')}
          className={`flex-1 sm:flex-none px-5 py-2.5 text-sm font-medium rounded-md transition-all ${
            purpose === 'sale' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Comprar
        </button>
        <button
          onClick={() => setPurpose('rent')}
          className={`flex-1 sm:flex-none px-5 py-2.5 text-sm font-medium rounded-md transition-all ${
            purpose === 'rent' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Alugar
        </button>
      </div>

      {/* Main filters — always visible */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <select value={type} onChange={e => setType(e.target.value)} className={selectClass} aria-label="Tipo do imóvel">
          <option value="">Tipo do imóvel</option>
          {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select value={neighborhood} onChange={e => setNeighborhood(e.target.value)} className={selectClass} aria-label="Bairro">
          <option value="">Bairro / Cidade</option>
          {NEIGHBORHOODS.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <select value={bedrooms} onChange={e => setBedrooms(e.target.value)} className={selectClass} aria-label="Quartos">
          <option value="">Quartos</option>
          {BEDROOM_OPTIONS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
        </select>
      </div>

      {/* Advanced filters — collapsible on mobile */}
      {isMobile && (
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mt-3 transition-colors"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {showFilters ? 'Menos filtros' : 'Mais filtros'}
          {hasActiveFilters && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
        </button>
      )}

      {(!isMobile || showFilters) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
          <Input className="h-11" placeholder="Valor mínimo" type="number" value={priceMin} onChange={e => setPriceMin(e.target.value)} aria-label="Valor mínimo" />
          <Input className="h-11" placeholder="Valor máximo" type="number" value={priceMax} onChange={e => setPriceMax(e.target.value)} aria-label="Valor máximo" />
          <Input className="h-11" placeholder="Código (ex: LDR001)" value={code} onChange={e => setCode(e.target.value)} aria-label="Código do imóvel" />
        </div>
      )}

      {/* Search button */}
      <Button onClick={handleSearch} className="w-full h-12 mt-4 gap-2 text-base font-semibold">
        <Search className="h-4 w-4" /> Buscar imóveis
      </Button>
    </div>
  );
};

export default SearchBar;
