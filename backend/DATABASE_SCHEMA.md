# Cannabis POS & Kiosk - Database Schema Design

## Overview
This document describes the complete normalized database schema for the Verdant Point Cannabis POS system.

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     Users       │       │   Customers     │       │    Products     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ email           │       │ email           │       │ sku             │
│ password_hash   │       │ first_name      │       │ name            │
│ pin_hash        │       │ last_name       │       │ category_id (FK)│
│ role            │       │ phone           │       │ strain_type     │
│ first_name      │       │ date_of_birth   │       │ thc_percentage  │
│ last_name       │       │ medical_card    │       │ cbd_percentage  │
│ phone           │       │ card_expiry     │       │ batch_id        │
│ is_active       │       │ loyalty_points  │       │ price           │
│ created_at      │       │ total_spent     │       │ cost            │
│ updated_at      │       │ visit_count     │       │ description     │
└─────────────────┘       │ created_at      │       │ supplier_id (FK)│
        │                 │ updated_at      │       │ is_active       │
        │                 └─────────────────┘       │ created_at      │
        │                         │                 │ updated_at      │
        │                         │                 └─────────────────┘
        │                         │                         │
        ▼                         ▼                         │
┌─────────────────┐       ┌─────────────────┐             │
│     Shifts      │       │  Transactions   │◄────────────┘
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ user_id (FK)    │───┐   │ customer_id (FK)│
│ clock_in        │   │   │ user_id (FK)    │
│ clock_out       │   │   │ subtotal        │
│ total_hours     │   │   │ tax_amount      │
│ total_sales     │   │   │ discount_amount │
│ created_at      │   │   │ total           │
└─────────────────┘   │   │ payment_method  │
                      │   │ payment_status  │
                      │   │ notes           │
                      │   │ created_at      │
                      │   │ updated_at      │
                      │   └─────────────────┘
                      │           │
                      │           ▼
                      │   ┌─────────────────┐
                      │   │TransactionItems │
                      │   ├─────────────────┤
                      │   │ id (PK)         │
                      │   │ transaction_id  │
                      │   │ product_id (FK) │
                      │   │ quantity        │
                      │   │ unit_price      │
                      │   │ discount        │
                      │   │ total           │
                      │   │ created_at      │
                      │   └─────────────────┘
                      │
                      ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   Inventory     │       │  Categories     │       │   Suppliers     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ product_id (FK) │       │ name            │       │ name            │
│ quantity        │       │ description     │       │ contact_name    │
│ reorder_level   │       │ tax_rate        │       │ email           │
│ reorder_quantity│       │ display_order   │       │ phone           │
│ last_restock    │       │ is_active       │       │ address         │
│ expiry_date     │       │ created_at      │       │ license_number  │
│ location        │       │ updated_at      │       │ is_active       │
│ updated_at      │       └─────────────────┘       │ created_at      │
└─────────────────┘                                 │ updated_at      │
                                                     └─────────────────┘

┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ ComplianceLogs  │       │AnalyticsSummary │       │   Settings      │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ event_type      │       │ date            │       │ key             │
│ user_id (FK)    │       │ total_sales     │       │ value           │
│ entity_type     │       │ total_revenue   │       │ category        │
│ entity_id       │       │ transaction_cnt │       │ is_encrypted    │
│ metrc_batch_id  │       │ avg_basket_size │       │ updated_by      │
│ action          │       │ top_product_id  │       │ updated_at      │
│ before_state    │       │ top_employee_id │       └─────────────────┘
│ after_state     │       │ unique_customers│
│ ip_address      │       │ created_at      │
│ created_at      │       └─────────────────┘
└─────────────────┘

┌─────────────────┐       ┌─────────────────┐
│  Notifications  │       │ BackgroundJobs  │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ user_id (FK)    │       │ name            │
│ type            │       │ type            │
│ title           │       │ status          │
│ message         │       │ data            │
│ priority        │       │ result          │
│ is_read         │       │ started_at      │
│ action_url      │       │ completed_at    │
│ created_at      │       │ created_at      │
└─────────────────┘       └─────────────────┘
```

## Detailed Schema Definitions

### 1. Users / Employees Table
Manages all system users with role-based access control.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  pin_hash VARCHAR(255), -- For quick POS login
  role VARCHAR(50) NOT NULL, -- 'admin', 'manager', 'budtender', 'inventory_clerk'
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
```

### 2. Customers Table
Customer profiles with loyalty and medical card tracking.

```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  date_of_birth DATE NOT NULL,
  medical_card_number VARCHAR(100),
  medical_card_expiry DATE,
  medical_card_state VARCHAR(2),
  loyalty_points INTEGER DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  visit_count INTEGER DEFAULT 0,
  preferred_contact VARCHAR(20), -- 'email', 'phone', 'none'
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_medical_card ON customers(medical_card_number);
```

### 3. Categories Table
Product categorization (flower, edibles, concentrates, etc.).

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  tax_rate DECIMAL(5, 2) NOT NULL, -- Percentage
  display_order INTEGER DEFAULT 0,
  icon VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_name ON categories(name);
CREATE INDEX idx_categories_is_active ON categories(is_active);
```

### 4. Suppliers Table
Supplier/vendor management for inventory sourcing.

```sql
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  contact_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  license_number VARCHAR(100) UNIQUE,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_suppliers_name ON suppliers(name);
CREATE INDEX idx_suppliers_license ON suppliers(license_number);
```

### 5. Products Table
Core product catalog with strain info and compliance tracking.

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE RESTRICT,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  strain_type VARCHAR(20), -- 'indica', 'sativa', 'hybrid', 'cbd', 'n/a'
  thc_percentage DECIMAL(5, 2),
  cbd_percentage DECIMAL(5, 2),
  batch_id VARCHAR(100), -- Seed-to-sale batch tracking
  metrc_id VARCHAR(100), -- METRC integration ID
  price DECIMAL(10, 2) NOT NULL,
  cost DECIMAL(10, 2), -- For margin calculations
  weight_grams DECIMAL(10, 2),
  description TEXT,
  image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_batch ON products(batch_id);
CREATE INDEX idx_products_metrc ON products(metrc_id);
CREATE INDEX idx_products_is_active ON products(is_active);
```

### 6. Inventory Table
Real-time stock management with reorder alerts.

```sql
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  reorder_level INTEGER DEFAULT 10,
  reorder_quantity INTEGER DEFAULT 50,
  last_restock_date DATE,
  expiry_date DATE,
  location VARCHAR(100), -- Storage location
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id)
);

CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_quantity ON inventory(quantity);
CREATE INDEX idx_inventory_expiry ON inventory(expiry_date);
```

### 7. Transactions Table
Sales transaction headers.

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Budtender
  subtotal DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL, -- 'cash', 'debit', 'credit'
  payment_status VARCHAR(20) DEFAULT 'completed', -- 'completed', 'refunded', 'void'
  register_id VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_customer ON transactions(customer_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_created ON transactions(created_at);
CREATE INDEX idx_transactions_number ON transactions(transaction_number);
```

### 8. Transaction Items Table
Individual line items per transaction.

```sql
CREATE TABLE transaction_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transaction_items_transaction ON transaction_items(transaction_id);
CREATE INDEX idx_transaction_items_product ON transaction_items(product_id);
```

### 9. Shifts Table
Employee shift tracking for time and sales accountability.

```sql
CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  clock_in TIMESTAMP NOT NULL,
  clock_out TIMESTAMP,
  total_hours DECIMAL(5, 2),
  total_sales DECIMAL(10, 2) DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  register_id VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shifts_user ON shifts(user_id);
CREATE INDEX idx_shifts_clock_in ON shifts(clock_in);
```

### 10. Compliance Logs Table
Audit trail for regulatory compliance and METRC integration.

```sql
CREATE TABLE compliance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL, -- 'sale', 'return', 'transfer', 'disposal', 'inventory_adjustment'
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  entity_type VARCHAR(50), -- 'product', 'transaction', 'inventory'
  entity_id UUID,
  metrc_batch_id VARCHAR(100),
  action VARCHAR(255) NOT NULL,
  before_state JSONB,
  after_state JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_compliance_event ON compliance_logs(event_type);
CREATE INDEX idx_compliance_user ON compliance_logs(user_id);
CREATE INDEX idx_compliance_created ON compliance_logs(created_at);
CREATE INDEX idx_compliance_metrc ON compliance_logs(metrc_batch_id);
```

### 11. Analytics Summary Table
Pre-computed daily analytics for performance.

```sql
CREATE TABLE analytics_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL,
  total_sales DECIMAL(10, 2) DEFAULT 0,
  total_revenue DECIMAL(10, 2) DEFAULT 0,
  total_cost DECIMAL(10, 2) DEFAULT 0,
  gross_profit DECIMAL(10, 2) DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  avg_basket_size DECIMAL(10, 2) DEFAULT 0,
  top_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  top_employee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  unique_customers INTEGER DEFAULT 0,
  new_customers INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analytics_date ON analytics_summary(date);
```

### 12. Settings Table
System configuration and preferences.

```sql
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  category VARCHAR(50), -- 'tax', 'store', 'notification', 'integration'
  is_encrypted BOOLEAN DEFAULT false,
  description TEXT,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_settings_key ON settings(key);
CREATE INDEX idx_settings_category ON settings(category);
```

### 13. Notifications Table
System and user notifications.

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'low_stock', 'compliance', 'system', 'shift'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'critical'
  is_read BOOLEAN DEFAULT false,
  action_url VARCHAR(500),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);
```

### 14. Background Jobs Table
Queue and track background processing tasks.

```sql
CREATE TABLE background_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'analytics', 'compliance_sync', 'backup', 'report'
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  data JSONB,
  result JSONB,
  error TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_background_jobs_type ON background_jobs(type);
CREATE INDEX idx_background_jobs_status ON background_jobs(status);
CREATE INDEX idx_background_jobs_created ON background_jobs(created_at);
```

## Data Flow Diagram

```
Frontend (POS/Kiosk)
       │
       ▼
  API Gateway (NestJS)
       │
       ├─── WebSocket Gateway (Real-time)
       │         │
       │         ├─► Redis PubSub ──► Other Clients
       │         │
       │         └─► Event Emitter
       │
       ├─── Authentication Middleware (JWT)
       │
       ├─── Authorization Guards (RBAC)
       │
       ▼
  Service Layer
       │
       ├─── Auth Service
       ├─── Users Service
       ├─── Products Service
       ├─── Inventory Service
       ├─── Sales Service
       ├─── Customers Service
       ├─── Analytics Service
       └─── Compliance Service
       │
       ▼
  Data Layer
       │
       ├─── Prisma ORM
       │         │
       │         ▼
       │    PostgreSQL
       │
       └─── Redis Cache
       │
       ▼
  Background Jobs (BullMQ)
       │
       ├─── Analytics Aggregation
       ├─── METRC Sync
       ├─── Daily Backups
       └─── Report Generation
```

## Security Considerations

1. **Password Hashing**: bcrypt with salt rounds >= 12
2. **PIN Hashing**: SHA-256 for quick POS login
3. **Field Encryption**: PII fields encrypted at rest (AES-256)
4. **Row-Level Security**: Implemented via application layer RBAC
5. **Audit Logging**: All compliance-critical operations logged
6. **SQL Injection**: Protected via Prisma ORM parameterized queries
7. **Rate Limiting**: API endpoints rate-limited via Redis

## Performance Optimizations

1. **Indexing**: All foreign keys and frequent query fields indexed
2. **Caching**: Redis caching for product catalog, user sessions
3. **Connection Pooling**: PostgreSQL connection pool (min: 5, max: 20)
4. **Read Replicas**: Support for read replica routing (future)
5. **Materialized Views**: Analytics summary table pre-computed daily
6. **Pagination**: All list endpoints paginated (default: 50 items)

## Backup Strategy

1. **Daily Full Backups**: Automated PostgreSQL dumps
2. **Point-in-Time Recovery**: WAL archiving enabled
3. **Backup Retention**: 30 days rolling retention
4. **Disaster Recovery**: Cross-region backup replication (production)

## Compliance Integration

### METRC API Integration Points

1. **Product Creation**: Sync to METRC packages
2. **Sales**: Report sales to METRC within 24 hours
3. **Inventory Adjustments**: Sync all changes
4. **Transfers**: Track product movement
5. **Disposal**: Log waste and disposal events

### Audit Requirements

- All transactions logged with timestamp, user, and action
- Immutable audit trail (append-only)
- 7-year retention for compliance logs
- Exportable to CSV/XML for state reporting
