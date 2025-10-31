import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface QueueEntry {
  id: string;
  customer_id: string;
  checked_in_by: string | null;
  checked_in_at: string;
  status: 'WAITING' | 'IN_SERVICE' | 'COMPLETED';
  notes: string | null;
  position: number | null;
  created_at: string;
  customers: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    email: string | null;
    date_of_birth: string;
    medical_card_number: string | null;
    medical_card_expiry: string | null;
    notes: string | null;
    loyalty_points: number;
    total_spent: number;
    visit_count: number;
  };
}

export function useQueue() {
  return useQuery({
    queryKey: ['customer-queue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_queue')
        .select(`
          *,
          customers (*)
        `)
        .in('status', ['WAITING', 'IN_SERVICE'])
        .order('checked_in_at', { ascending: true });
      
      if (error) throw error;
      return data as QueueEntry[];
    },
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });
}

export function useAddToQueue() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ customerId, notes }: { customerId: string; notes?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('customer_queue')
        .insert({
          customer_id: customerId,
          checked_in_by: user?.id,
          notes,
          status: 'WAITING',
        })
        .select(`
          *,
          customers (*)
        `)
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-queue'] });
      toast.success('Customer added to queue');
    },
    onError: (error: any) => {
      toast.error(`Failed to add customer: ${error.message}`);
    },
  });
}

export function useUpdateQueueStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'WAITING' | 'IN_SERVICE' | 'COMPLETED' }) => {
      const { data, error } = await supabase
        .from('customer_queue')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-queue'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });
}

export function useRemoveFromQueue() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('customer_queue')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-queue'] });
      toast.success('Customer removed from queue');
    },
    onError: (error: any) => {
      toast.error(`Failed to remove customer: ${error.message}`);
    },
  });
}
