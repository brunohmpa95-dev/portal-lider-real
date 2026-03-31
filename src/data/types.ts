export interface Property {
  id: string;
  code: string;
  title: string;
  type: PropertyType;
  purpose: 'sale' | 'rent';
  price: number;
  neighborhood: string;
  city: string;
  state: string;
  address?: string;
  bedrooms: number;
  suites: number;
  bathrooms: number;
  parkingSpots: number;
  area: number;
  description: string;
  features: string[];
  images: string[];
  isFeatured: boolean;
  isSuperFeatured: boolean;
  isNew: boolean;
  createdAt: string;
}

export type PropertyType = 'casa' | 'apartamento' | 'terreno' | 'comercial' | 'kitnet' | 'chácara';

export interface DepartmentContact {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  hours: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export interface FilterState {
  purpose: 'sale' | 'rent' | '';
  type: PropertyType | '';
  neighborhood: string;
  bedrooms: string;
  priceMin: string;
  priceMax: string;
  code: string;
  sortBy: 'recent' | 'price-asc' | 'price-desc';
}
