import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import type { Property } from '@/data/types';

type DbProperty = Tables<'properties'>;

export function mapDbProperty(p: DbProperty): Property {
  return {
    id: p.id,
    code: p.code,
    title: p.title,
    type: p.type as Property['type'],
    purpose: p.purpose as 'sale' | 'rent',
    price: Number(p.price),
    neighborhood: p.neighborhood || '',
    city: p.city,
    state: p.state,
    address: p.address || undefined,
    bedrooms: p.bedrooms,
    suites: p.suites,
    bathrooms: p.bathrooms,
    parkingSpots: p.parking_spots,
    area: Number(p.area),
    description: p.description || '',
    features: p.features || [],
    images: p.images || [],
    isFeatured: p.is_featured,
    isSuperFeatured: p.is_super_featured,
    isNew: p.is_new,
    createdAt: p.created_at,
    condominiumFee: p.condominium_fee ? Number(p.condominium_fee) : undefined,
    iptu: p.iptu ? Number(p.iptu) : undefined,
    status: p.status,
  };
}

export function useProperties(filters?: {
  purpose?: string;
  type?: string;
  neighborhood?: string;
  bedrooms?: string;
  priceMin?: string;
  priceMax?: string;
  code?: string;
  sortBy?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: async () => {
      let query = supabase
        .from('properties')
        .select('*', { count: 'exact' })
        .eq('status', 'published');

      if (filters?.purpose) query = query.eq('purpose', filters.purpose);
      if (filters?.type) query = query.eq('type', filters.type);
      if (filters?.neighborhood) query = query.eq('neighborhood', filters.neighborhood);
      if (filters?.bedrooms) {
        const beds = parseInt(filters.bedrooms);
        if (beds >= 4) query = query.gte('bedrooms', 4);
        else query = query.eq('bedrooms', beds);
      }
      if (filters?.priceMin) query = query.gte('price', parseInt(filters.priceMin));
      if (filters?.priceMax) query = query.lte('price', parseInt(filters.priceMax));
      if (filters?.code) query = query.ilike('code', `%${filters.code}%`);

      if (filters?.sortBy === 'price-asc') query = query.order('price', { ascending: true });
      else if (filters?.sortBy === 'price-desc') query = query.order('price', { ascending: false });
      else query = query.order('created_at', { ascending: false });

      if (filters?.limit) query = query.limit(filters.limit);
      if (filters?.offset) query = query.range(filters.offset, filters.offset + (filters.limit || 12) - 1);

      const { data, error, count } = await query;
      if (error) throw error;
      return { properties: (data || []).map(mapDbProperty), count: count || 0 };
    },
  });
}

export function useFeaturedProperties(purpose?: 'sale' | 'rent') {
  return useQuery({
    queryKey: ['properties', 'featured', purpose],
    queryFn: async () => {
      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'published')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (purpose) query = query.eq('purpose', purpose);

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(mapDbProperty);
    },
  });
}

export function useSuperFeaturedProperty() {
  return useQuery({
    queryKey: ['properties', 'super-featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'published')
        .eq('is_super_featured', true)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data ? mapDbProperty(data) : null;
    },
  });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .eq('status', 'published')
        .maybeSingle();

      if (error) throw error;
      return data ? mapDbProperty(data) : null;
    },
    enabled: !!id,
  });
}

export function useSimilarProperties(property: Property | null) {
  return useQuery({
    queryKey: ['properties', 'similar', property?.id],
    queryFn: async () => {
      if (!property) return [];
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'published')
        .eq('purpose', property.purpose)
        .eq('type', property.type)
        .neq('id', property.id)
        .limit(3);

      if (error) throw error;
      return (data || []).map(mapDbProperty);
    },
    enabled: !!property,
  });
}
