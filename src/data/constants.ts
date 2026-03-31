export const COMPANY = {
  name: 'Líder Imóveis',
  fullName: 'Líder Imóveis Itaúna',
  creci: 'CRECI-MG 12345-J',
  phone: '(37) 3241-5000',
  whatsapp: '(37) 99900-5000',
  whatsappLink: 'https://wa.me/5537999005000',
  email: 'contato@liderimoveis.com.br',
  address: 'Rua Dr. Augusto Gonçalves, 250 - Centro, Itaúna - MG, 35680-054',
  city: 'Itaúna',
  state: 'MG',
  hours: 'Seg a Sex: 08h às 18h | Sáb: 08h às 12h',
  instagram: 'https://instagram.com/liderimoveisitauna',
  facebook: 'https://facebook.com/liderimoveisitauna',
  systemUrl: '#', // URL do sistema principal — substituir quando integrar
  clientAreaUrl: '#',
  documentsUrl: '#',
};

export const DEPARTMENTS = {
  sales: {
    id: 'sales',
    name: 'Vendas',
    phone: '(37) 3241-5001',
    whatsapp: '(37) 99901-5001',
    email: 'vendas@liderimoveis.com.br',
    hours: 'Seg a Sex: 08h às 18h',
  },
  rental: {
    id: 'rental',
    name: 'Locação',
    phone: '(37) 3241-5002',
    whatsapp: '(37) 99902-5002',
    email: 'locacao@liderimoveis.com.br',
    hours: 'Seg a Sex: 08h às 18h',
  },
  financial: {
    id: 'financial',
    name: 'Financeiro',
    phone: '(37) 3241-5003',
    whatsapp: '(37) 99903-5003',
    email: 'financeiro@liderimoveis.com.br',
    hours: 'Seg a Sex: 08h às 17h',
  },
  support: {
    id: 'support',
    name: 'Atendimento',
    phone: '(37) 3241-5000',
    whatsapp: '(37) 99900-5000',
    email: 'atendimento@liderimoveis.com.br',
    hours: 'Seg a Sex: 08h às 18h | Sáb: 08h às 12h',
  },
};

export const NEIGHBORHOODS = [
  'Centro',
  'Santa Edwiges',
  'São Geraldo',
  'Piedade',
  'Santo Antônio',
  'Residencial Morro Verde',
  'Vila Romana',
  'Alvorada',
  'Graças',
  'São José',
  'Bela Vista',
  'Vila São Fernando',
];

export const PROPERTY_TYPES = [
  { value: 'casa', label: 'Casa' },
  { value: 'apartamento', label: 'Apartamento' },
  { value: 'terreno', label: 'Terreno' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'kitnet', label: 'Kitnet' },
  { value: 'chácara', label: 'Chácara' },
];

export const BEDROOM_OPTIONS = [
  { value: '1', label: '1 quarto' },
  { value: '2', label: '2 quartos' },
  { value: '3', label: '3 quartos' },
  { value: '4', label: '4+ quartos' },
];
