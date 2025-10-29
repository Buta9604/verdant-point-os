import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          inventory(*)
        `)
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      name: string;
      sku: string;
      category_id: string;
      price: number;
      thc_percentage: number;
      cbd_percentage: number;
      quantity: number;
      reorder_level: number;
    }) => {
      // First create the product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          name: data.name,
          sku: data.sku,
          category_id: data.category_id,
          price: data.price,
          thc_percentage: data.thc_percentage,
          cbd_percentage: data.cbd_percentage,
        })
        .select()
        .single();
      
      if (productError) throw productError;
      
      // Then create the inventory entry
      const { error: inventoryError } = await supabase
        .from('inventory')
        .insert({
          product_id: product.id,
          quantity: data.quantity,
          reorder_level: data.reorder_level,
          last_restock_date: new Date().toISOString(),
        });
      
      if (inventoryError) throw inventoryError;
      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Product added successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to add product: ${error.message}`);
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          inventory(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}
