-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.background_jobs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (public.is_admin(auth.uid()));

-- ============================================
-- USER ROLES POLICIES
-- ============================================

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.is_admin(auth.uid()));

-- ============================================
-- CATEGORIES POLICIES
-- ============================================

CREATE POLICY "Everyone can view active categories"
  ON public.categories FOR SELECT
  USING (is_active = true OR public.is_manager_or_admin(auth.uid()));

CREATE POLICY "Managers can manage categories"
  ON public.categories FOR ALL
  USING (public.is_manager_or_admin(auth.uid()));

-- ============================================
-- SUPPLIERS POLICIES
-- ============================================

CREATE POLICY "Authenticated users can view suppliers"
  ON public.suppliers FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Managers can manage suppliers"
  ON public.suppliers FOR ALL
  USING (public.is_manager_or_admin(auth.uid()));

-- ============================================
-- PRODUCTS POLICIES
-- ============================================

CREATE POLICY "Everyone can view active products"
  ON public.products FOR SELECT
  USING (is_active = true OR public.is_manager_or_admin(auth.uid()));

CREATE POLICY "Managers can manage products"
  ON public.products FOR ALL
  USING (public.is_manager_or_admin(auth.uid()));

-- ============================================
-- INVENTORY POLICIES
-- ============================================

CREATE POLICY "Authenticated users can view inventory"
  ON public.inventory FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Staff can update inventory"
  ON public.inventory FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'INVENTORY_CLERK') OR
    public.is_manager_or_admin(auth.uid())
  );

CREATE POLICY "Managers can manage inventory"
  ON public.inventory FOR ALL
  USING (public.is_manager_or_admin(auth.uid()));

-- ============================================
-- CUSTOMERS POLICIES
-- ============================================

CREATE POLICY "Staff can view customers"
  ON public.customers FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Staff can create customers"
  ON public.customers FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Staff can update customers"
  ON public.customers FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Managers can delete customers"
  ON public.customers FOR DELETE
  USING (public.is_manager_or_admin(auth.uid()));

-- ============================================
-- TRANSACTIONS POLICIES
-- ============================================

CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (
    auth.uid() = user_id OR
    public.is_manager_or_admin(auth.uid())
  );

CREATE POLICY "Staff can create transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Managers can update transactions"
  ON public.transactions FOR UPDATE
  USING (public.is_manager_or_admin(auth.uid()));

CREATE POLICY "Admins can delete transactions"
  ON public.transactions FOR DELETE
  USING (public.is_admin(auth.uid()));

-- ============================================
-- TRANSACTION ITEMS POLICIES
-- ============================================

CREATE POLICY "Users can view transaction items"
  ON public.transaction_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.transactions
      WHERE transactions.id = transaction_items.transaction_id
      AND (transactions.user_id = auth.uid() OR public.is_manager_or_admin(auth.uid()))
    )
  );

CREATE POLICY "Staff can create transaction items"
  ON public.transaction_items FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Managers can update transaction items"
  ON public.transaction_items FOR UPDATE
  USING (public.is_manager_or_admin(auth.uid()));

CREATE POLICY "Admins can delete transaction items"
  ON public.transaction_items FOR DELETE
  USING (public.is_admin(auth.uid()));

-- ============================================
-- SHIFTS POLICIES
-- ============================================

CREATE POLICY "Users can view own shifts"
  ON public.shifts FOR SELECT
  USING (
    auth.uid() = user_id OR
    public.is_manager_or_admin(auth.uid())
  );

CREATE POLICY "Users can create own shifts"
  ON public.shifts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shifts"
  ON public.shifts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Managers can manage all shifts"
  ON public.shifts FOR ALL
  USING (public.is_manager_or_admin(auth.uid()));

-- ============================================
-- COMPLIANCE LOGS POLICIES
-- ============================================

CREATE POLICY "Managers can view compliance logs"
  ON public.compliance_logs FOR SELECT
  USING (public.is_manager_or_admin(auth.uid()));

CREATE POLICY "Authenticated users can create compliance logs"
  ON public.compliance_logs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage compliance logs"
  ON public.compliance_logs FOR ALL
  USING (public.is_admin(auth.uid()));

-- ============================================
-- ANALYTICS POLICIES
-- ============================================

CREATE POLICY "Managers can view analytics"
  ON public.analytics_summary FOR SELECT
  USING (public.is_manager_or_admin(auth.uid()));

CREATE POLICY "Admins can manage analytics"
  ON public.analytics_summary FOR ALL
  USING (public.is_admin(auth.uid()));

-- ============================================
-- SETTINGS POLICIES
-- ============================================

CREATE POLICY "Authenticated users can view settings"
  ON public.settings FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage settings"
  ON public.settings FOR ALL
  USING (public.is_admin(auth.uid()));

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- BACKGROUND JOBS POLICIES
-- ============================================

CREATE POLICY "Admins can view jobs"
  ON public.background_jobs FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "System can manage jobs"
  ON public.background_jobs FOR ALL
  USING (public.is_admin(auth.uid()));

-- ============================================
-- REALTIME SUBSCRIPTIONS
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shifts;