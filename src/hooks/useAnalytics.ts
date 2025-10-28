import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's transactions
      const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select('total, created_at, customer_id')
        .gte('created_at', `${today}T00:00:00`)
        .eq('payment_status', 'COMPLETED');
      
      if (txError) throw txError;

      const totalRevenue = transactions?.reduce((sum, t) => sum + Number(t.total), 0) || 0;
      const transactionCount = transactions?.length || 0;
      const avgTransaction = transactionCount > 0 ? totalRevenue / transactionCount : 0;
      const uniqueCustomers = new Set(transactions?.map(t => t.customer_id).filter(Boolean)).size;

      return {
        totalRevenue,
        transactionCount,
        avgTransaction,
        uniqueCustomers,
      };
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useTopProducts(limit: number = 5) {
  return useQuery({
    queryKey: ['analytics', 'top-products', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transaction_items')
        .select(`
          product_id,
          quantity,
          total,
          product:products(name, category:categories(name))
        `)
        .limit(limit);
      
      if (error) throw error;

      // Aggregate by product
      const productStats = data.reduce((acc: any, item: any) => {
        const productId = item.product_id;
        if (!acc[productId]) {
          acc[productId] = {
            name: item.product?.name || 'Unknown',
            category: item.product?.category?.name || 'Unknown',
            sales: 0,
            revenue: 0,
          };
        }
        acc[productId].sales += item.quantity;
        acc[productId].revenue += Number(item.total);
        return acc;
      }, {});

      return Object.values(productStats)
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, limit);
    },
  });
}

export function useRecentTransactions(limit: number = 10) {
  return useQuery({
    queryKey: ['transactions', 'recent', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          customer:customers(first_name, last_name),
          items:transaction_items(quantity)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
