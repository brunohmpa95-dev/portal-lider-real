import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NEIGHBORHOODS, PROPERTY_TYPES, BEDROOM_OPTIONS } from '@/data/constants';

const SearchBar = () => {
  const navigate = useNavigate();
  const [purpose, setPurpose] = useState<'sale' | 'rent'>('sale');
  const [type, setType] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [code, setCode] = useState('');

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

  const selectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-lg w-full max-w-5xl mx-auto">
      {/* Purpose toggle */}
      <div className="flex mb-5 bg-secondary rounded-lg p-1 w-fit">
        <button
          onClick={() => setPurpose('sale')}
          className={`px-5 py-2 text-sm font-medium rounded-md transition-all ${
            purpose === 'sale' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Comprar
        </button>
        <button
          onClick={() => setPurpose('rent')}
          className={`px-5 py-2 text-sm font-medium rounded-md transition-all ${
            purpose === 'rent' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Alugar
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
        <Input
          placeholder="Código (ex: LDR001)"
          value={code}
          onChange={e => setCode(e.target.value)}
          aria-label="Código do imóvel"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
        <Input placeholder="Valor mínimo" type="number" value={priceMin} onChange={e => setPriceMin(e.target.value)} aria-label="Valor mínimo" />
        <Input placeholder="Valor máximo" type="number" value={priceMax} onChange={e => setPriceMax(e.target.value)} aria-label="Valor máximo" />
        <Button onClick={handleSearch} className="h-10 gap-2">
          <Search className="h-4 w-4" /> Buscar imóveis
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;
