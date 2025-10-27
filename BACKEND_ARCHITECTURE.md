# Green Point POS - Backend Architecture Documentation

## 🏗️ Architecture Overview

The Green Point Cannabis Dispensary POS system is built on **Lovable Cloud** (powered by Supabase), providing a complete backend infrastructure with PostgreSQL database, authentication, real-time subscriptions, and serverless Edge Functions.

### Technology Stack

- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth with JWT tokens
- **API**: Auto-generated REST API + Real-time subscriptions
- **Backend Logic**: Supabase Edge Functions (Deno runtime)
- **ORM**: Direct SQL + Supabase Client SDK
- **Security**: Row Level Security (RLS) policies

---

## 📊 Database Schema

### Core Tables

#### 1. **User Management**

**profiles**
- Primary user data table (references auth.users)
- Fields: id, email, first_name, last_name, phone, pin_hash, is_active, last_login
- Automatically created on signup via trigger

**user_roles**
- Stores user roles separately for security
- Enum types: ADMIN, MANAGER, BUDTENDER, INVENTORY_CLERK
- Prevents privilege escalation attacks

#### 2. **Product Catalog**

**categories**
- Product categorization with tax rates
- Fields: name, description, tax_rate, display_order, icon, is_active

**suppliers**
- Licensed cannabis suppliers
- Fields: name, contact_name, email, phone, license_number

**products**
- Complete product catalog
- Fields: sku, name, category_id, supplier_id, strain_type, thc_percentage, cbd_percentage, batch_id, metrc_id, price, cost, weight_grams
- Enums: strain_type (INDICA, SATIVA, HYBRID, CBD, NA)

#### 3. **Inventory Management**

**inventory**
- Real-time stock tracking (realtime enabled)
- Fields: product_id, quantity, reorder_level, reorder_quantity, last_restock_date, expiry_date, location
- Low stock alerts automatically generated

#### 4. **Sales & Transactions**

**transactions**
- All point-of-sale transactions (realtime enabled)
- Fields: transaction_number, customer_id, user_id, subtotal, tax_amount, discount_amount, total, payment_method, payment_status
- Enums: payment_method (CASH, DEBIT, CREDIT), payment_status (COMPLETED, REFUNDED, VOID)

**transaction_items**
- Line items for each transaction
- Fields: transaction_id, product_id, quantity, unit_price, discount, total

#### 5. **Customer Management**

**customers**
- Customer profiles with loyalty program
- Fields: email, first_name, last_name, phone, date_of_birth, medical_card_number, medical_card_expiry, loyalty_points, total_spent, visit_count

#### 6. **Employee Management**

**shifts**
- Employee clock-in/out tracking (realtime enabled)
- Fields: user_id, clock_in, clock_out, total_hours, total_sales, transaction_count, register_id

#### 7. **Compliance & Audit**

**compliance_logs**
- Comprehensive audit trail for regulatory compliance
- Fields: event_type, user_id, entity_type, entity_id, metrc_batch_id, action, before_state, after_state, ip_address
- Enums: SALE, RETURN, TRANSFER, DISPOSAL, INVENTORY_ADJUSTMENT, METRC_SYNC

#### 8. **Analytics**

**analytics_summary**
- Daily aggregated analytics
- Fields: date, total_sales, total_revenue, total_cost, gross_profit, transaction_count, avg_basket_size, unique_customers, new_customers

#### 9. **System**

**settings**
- System configuration
- Fields: key, value, category, is_encrypted, description
- Categories: TAX, STORE, NOTIFICATION, INTEGRATION, SYSTEM

**notifications**
- User notifications (realtime enabled)
- Fields: user_id, type, title, message, priority, is_read, action_url
- Types: LOW_STOCK, COMPLIANCE, SYSTEM, SHIFT, SALES

**background_jobs**
- Async job tracking
- Fields: name, type, status, data, result, error, started_at, completed_at

---

## 🔒 Security Architecture

### Row Level Security (RLS)

All tables have RLS enabled with comprehensive policies:

#### **Role-Based Access Control**

```sql
-- Security definer functions prevent RLS recursion
has_role(user_id, role) - Check specific role
is_admin(user_id) - Check admin role
is_manager_or_admin(user_id) - Check elevated permissions
```

#### **Policy Examples**

**Profiles**:
- Users can view/update their own profile
- Admins can view/manage all profiles

**Products**:
- Everyone can view active products
- Managers can manage all products

**Transactions**:
- Users can view their own transactions
- Managers can view/update all transactions
- Only admins can delete transactions

**Customers**:
- All authenticated staff can view/create/update customers
- Only managers can delete customers

**Inventory**:
- All staff can view inventory
- Inventory clerks and managers can update
- Only managers can insert/delete

### Authentication Flow

1. **Sign Up**: User creates account via `/auth`
2. **Auto Profile Creation**: Trigger creates profile in `profiles` table
3. **JWT Token**: Supabase issues JWT for authenticated requests
4. **Role Assignment**: Admin assigns roles via `user_roles` table
5. **PIN Login** (Optional): Additional security for POS terminals

---

## 🔄 Real-Time Features

### Enabled Tables

The following tables have real-time subscriptions enabled:

1. **inventory** - Live stock updates across terminals
2. **transactions** - Real-time sales updates
3. **notifications** - Instant alerts
4. **shifts** - Live employee status

### Frontend Integration

```typescript
// Example: Subscribe to inventory changes
const channel = supabase
  .channel('inventory-changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'inventory' },
    (payload) => console.log('Inventory updated:', payload)
  )
  .subscribe()
```

---

## ⚙️ Backend Functions Architecture

### Edge Functions (Deno Runtime)

Edge Functions run on Deno and handle:
- Complex business logic
- Third-party API integrations
- Analytics calculations
- Report generation
- METRC compliance sync

### Planned Edge Functions

1. **`process-sale`**
   - Create transaction
   - Update inventory
   - Apply loyalty points
   - Log compliance event

2. **`generate-analytics`**
   - Calculate daily summaries
   - Identify top products/employees
   - Compute profitability metrics

3. **`sync-metrc`**
   - Push sales data to state tracking
   - Update batch statuses
   - Handle compliance reporting

4. **`generate-report`**
   - Export CSV/PDF reports
   - Filter by date range, employee, product
   - Include compliance data

5. **`low-stock-alerts`**
   - Check inventory levels
   - Create notifications
   - Email/SMS alerts

---

## 📈 Data Flow Architecture

### Sale Processing Flow

```
1. Frontend (POS Terminal)
   ↓
2. Edge Function: process-sale
   ↓
3. Create Transaction Record
   ↓
4. Create Transaction Items
   ↓
5. Update Inventory (triggers realtime)
   ↓
6. Update Customer Loyalty
   ↓
7. Create Compliance Log
   ↓
8. Return Receipt Data
```

### Analytics Generation Flow

```
1. Scheduled Cron Job (Daily)
   ↓
2. Edge Function: generate-analytics
   ↓
3. Aggregate transaction data
   ↓
4. Calculate metrics
   ↓
5. Insert analytics_summary record
   ↓
6. Generate low stock alerts
```

---

## 🔗 API Endpoints (Auto-generated)

Supabase automatically generates REST endpoints:

### Products
- `GET /rest/v1/products?select=*`
- `POST /rest/v1/products`
- `PATCH /rest/v1/products?id=eq.{id}`
- `DELETE /rest/v1/products?id=eq.{id}`

### Transactions
- `GET /rest/v1/transactions?select=*,transaction_items(*,product:products(*))`
- `POST /rest/v1/transactions`

### Customers
- `GET /rest/v1/customers?email=eq.{email}`
- `POST /rest/v1/customers`

### Query Filters
- Equality: `?column=eq.value`
- Greater than: `?column=gt.value`
- Like: `?column=like.*search*`
- Order: `?order=column.desc`
- Limit: `?limit=10`

---

## 🔍 Frontend-Backend Integration

### Supabase Client Setup

```typescript
import { supabase } from "@/integrations/supabase/client";

// Query products
const { data: products } = await supabase
  .from('products')
  .select('*, category:categories(*), inventory(*)')
  .eq('is_active', true);

// Insert transaction
const { data: transaction } = await supabase
  .from('transactions')
  .insert({
    transaction_number: 'TXN-' + Date.now(),
    user_id: userId,
    subtotal: 100,
    tax_amount: 25,
    total: 125,
    payment_method: 'CASH'
  })
  .select()
  .single();
```

### Authentication Context

```typescript
// Frontend auth context manages session
const { user, session, signIn, signOut } = useAuth();

// All API calls include auth token automatically
const { data } = await supabase
  .from('transactions')
  .select('*');  // User's transactions only (RLS enforced)
```

---

## 📊 Compliance & Reporting

### METRC Integration (Planned)

1. **Batch Tracking**: Link products to state tracking IDs
2. **Sale Reporting**: Push transactions to METRC API
3. **Transfer Logs**: Track product movements
4. **Destruction Logs**: Record waste disposal

### Audit Trail

Every sensitive operation is logged in `compliance_logs`:
- User who performed action
- Before/after state (JSON)
- Timestamp and IP address
- METRC batch ID if applicable

---

## 🚀 Deployment & Scaling

### Automatic Deployment

Edge Functions deploy automatically when code is pushed. No manual deployment needed.

### Database Backups

- Automatic daily backups
- Point-in-time recovery available
- Manual backup option via Lovable Cloud dashboard

### Performance Optimization

1. **Indexes**: All foreign keys and commonly queried columns indexed
2. **RLS Policies**: Optimized using security definer functions
3. **Real-time**: Only critical tables enabled to reduce overhead
4. **Edge Functions**: Run at edge locations for low latency

---

## 🔄 Future Enhancements

1. **Multi-store Support**: Add store_id to all tables
2. **Advanced Analytics**: Predictive inventory, sales forecasting
3. **Payment Gateway**: Stripe/Square integration for card processing
4. **SMS Notifications**: Twilio integration for alerts
5. **Mobile App**: Native iOS/Android POS apps
6. **API Rate Limiting**: Implement request throttling
7. **Webhooks**: Event-driven integrations
8. **Offline Mode**: Local SQLite sync when internet down

---

## 📝 Summary

The backend architecture is designed for:
- ✅ **Security**: Comprehensive RLS policies, role-based access
- ✅ **Compliance**: Complete audit trails, METRC-ready
- ✅ **Scalability**: Edge functions, real-time subscriptions
- ✅ **Performance**: Indexed queries, optimized policies
- ✅ **Maintainability**: Clear schema, auto-generated APIs
- ✅ **Developer Experience**: TypeScript types, auto-complete

All backend functionality is integrated with the frontend through Lovable Cloud, providing a seamless full-stack development experience.
