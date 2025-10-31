-- Create helper function for security role check
CREATE OR REPLACE FUNCTION public.is_security(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'SECURITY')
$$;