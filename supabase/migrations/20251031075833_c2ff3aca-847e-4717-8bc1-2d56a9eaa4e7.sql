-- Create customer queue table
CREATE TABLE IF NOT EXISTS public.customer_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  checked_in_by UUID REFERENCES auth.users(id),
  checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'WAITING', -- WAITING, IN_SERVICE, COMPLETED
  notes TEXT,
  position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customer_queue ENABLE ROW LEVEL SECURITY;

-- Policies for customer queue
CREATE POLICY "Staff can view queue"
  ON public.customer_queue
  FOR SELECT
  TO authenticated
  USING (auth.role() = 'authenticated');

CREATE POLICY "Staff can add to queue"
  ON public.customer_queue
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Staff can update queue"
  ON public.customer_queue
  FOR UPDATE
  TO authenticated
  USING (auth.role() = 'authenticated');

CREATE POLICY "Staff can delete from queue"
  ON public.customer_queue
  FOR DELETE
  TO authenticated
  USING (auth.role() = 'authenticated');

-- Add updated_at trigger
CREATE TRIGGER update_customer_queue_updated_at
  BEFORE UPDATE ON public.customer_queue
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for queue
ALTER PUBLICATION supabase_realtime ADD TABLE public.customer_queue;