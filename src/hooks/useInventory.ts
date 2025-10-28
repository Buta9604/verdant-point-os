import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useInventory() {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          *,
          product:products(
            *,
            category:categories(*)
          )
        `)
        .order('product(name)');
      
      if (error) throw error;
      return data;
    },
  });
}

export function useLowStockItems() {
  return useQuery({
    queryKey: ['inventory', 'low-stock'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          *,
          product:products(*)
        `)
        .lte('quantity', supabase.from('inventory').select('reorder_level'))
        .order('quantity', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });
}
