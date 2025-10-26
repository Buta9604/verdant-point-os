# Verdant Point Cannabis POS - Backend API

## Overview

This is the backend API for the Verdant Point Cannabis Dispensary POS and Kiosk system. Built with NestJS, TypeScript, PostgreSQL, and Redis, it provides a robust, scalable, and compliant solution for cannabis retail operations.

## Tech Stack

- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Cache/Sessions**: Redis
- **Authentication**: JWT + PIN
- **WebSockets**: Socket.io
- **Background Jobs**: Bull Queue (BullMQ)
- **Validation**: class-validator, class-transformer
- **Security**: Helmet, bcrypt, CORS

## Features

### Core Functionality
- ✅ JWT-based authentication with refresh tokens
- ✅ PIN-based quick login for POS terminals
- ✅ Role-based access control (RBAC)
- ✅ Real-time updates via WebSockets
- ✅ Redis caching for performance
- ✅ Background job processing
- ✅ Comprehensive audit logging

### Business Features
- 🛒 **Sales Management**: Complete POS transaction handling
- 📦 **Inventory Tracking**: Real-time stock management with alerts
- 👥 **Customer Management**: Loyalty programs, purchase history
- 📊 **Analytics**: Sales reports, top products, employee performance
- ⚖️ **Compliance**: Seed-to-sale tracking, METRC integration ready
- 🔔 **Notifications**: Real-time alerts for low stock, compliance
- ⚙️ **Settings**: Configurable tax rates, store preferences

## Prerequisites

- Node.js >= 18.x
- PostgreSQL >= 14.x
- Redis >= 6.x
- npm or yarn or bun

## Installation

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
bun install
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/verdant_point"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=24h

# Application
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### 3. Database Setup

Generate Prisma client:

```bash
npm run prisma:generate
```

Run migrations:

```bash
npm run prisma:migrate
```

Seed the database with sample data:

```bash
npm run prisma:seed
```

### 4. Start the Server

Development mode (with hot reload):

```bash
npm run start:dev
```

Production mode:

```bash
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`

## Default Login Credentials

After seeding, you can use these credentials:

- **Admin**: `admin@verdantpoint.com` / `admin123` (PIN: 1234)
- **Manager**: `manager@verdantpoint.com` / `manager123` (PIN: 2345)
- **Budtender**: `budtender@verdantpoint.com` / `budtender123` (PIN: 3456)

## API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication

All endpoints (except auth endpoints) require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Core Endpoints

#### Authentication
- `POST /auth/login` - Email/password login
- `POST /auth/pin-login` - PIN-based login
- `POST /auth/register` - Register new user (admin only)
- `POST /auth/refresh` - Refresh access token

#### Users
- `GET /users` - List all users (paginated)
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

#### Products
- `GET /products` - List all products (paginated, filterable)
- `GET /products/:id` - Get product by ID
- `GET /products/sku/:sku` - Get product by SKU
- `POST /products` - Create new product
- `PATCH /products/:id` - Update product
- `DELETE /products/:id` - Delete product

#### Inventory
- `GET /inventory` - List all inventory
- `GET /inventory/low-stock` - Get low stock items
- `GET /inventory/expiring` - Get expiring items
- `GET /inventory/product/:productId` - Get inventory for product
- `PATCH /inventory/:id` - Update inventory

#### Sales
- `POST /sales` - Create new transaction
- `GET /sales` - List all transactions (paginated, filterable)
- `GET /sales/:id` - Get transaction by ID
- `GET /sales/summary` - Get sales summary
- `PATCH /sales/:id/refund` - Refund transaction

#### Customers
- `GET /customers` - List all customers (paginated)
- `GET /customers/:id` - Get customer by ID
- `GET /customers/search?q=query` - Search customers
- `POST /customers` - Create new customer
- `PATCH /customers/:id` - Update customer
- `DELETE /customers/:id` - Delete customer

#### Analytics
- `GET /analytics/dashboard` - Get dashboard statistics
- `GET /analytics/top-products` - Get top selling products
- `GET /analytics/top-employees` - Get top performing employees
- `GET /analytics/sales-over-time` - Get sales trends

#### Compliance
- `GET /compliance/logs` - Get all compliance logs
- `GET /compliance/logs/:eventType` - Get logs by event type
- `GET /compliance/export` - Export compliance report

#### Notifications
- `GET /notifications` - Get all notifications
- `GET /notifications/unread` - Get unread notifications
- `PATCH /notifications/:id/read` - Mark as read
- `PATCH /notifications/read-all` - Mark all as read

#### Settings
- `GET /settings` - Get all settings
- `GET /settings/:key` - Get setting by key
- `POST /settings` - Create/update setting
- `DELETE /settings/:key` - Delete setting

### WebSocket Events

Connect to WebSocket at: `ws://localhost:3000`

#### Listening Events
- `inventory:updated` - Inventory quantity changed
- `sale:completed` - New sale completed
- `notification:new` - New notification
- `pos:sync` - POS synchronization event

#### Emitting Events
- `join-room` - Join a specific room
- `leave-room` - Leave a room
- `ping` - Ping server (responds with pong)

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
├── src/
│   ├── common/            # Shared utilities
│   │   ├── decorators/    # Custom decorators
│   │   ├── dto/           # Common DTOs
│   │   ├── filters/       # Exception filters
│   │   ├── guards/        # Auth guards
│   │   └── interceptors/  # Response interceptors
│   ├── config/            # Configuration
│   ├── database/          # Database services
│   │   ├── prisma.service.ts
│   │   └── redis.service.ts
│   ├── gateways/          # WebSocket gateways
│   │   └── events.gateway.ts
│   ├── modules/           # Feature modules
│   │   ├── auth/          # Authentication
│   │   ├── users/         # User management
│   │   ├── products/      # Product catalog
│   │   ├── inventory/     # Inventory tracking
│   │   ├── sales/         # Sales transactions
│   │   ├── customers/     # Customer management
│   │   ├── analytics/     # Analytics & reporting
│   │   ├── compliance/    # Compliance logging
│   │   ├── notifications/ # Notifications
│   │   └── settings/      # System settings
│   ├── app.module.ts      # Root module
│   └── main.ts            # Application entry
├── .env.example           # Environment template
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript config
```

## Development

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Database Management

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npm run prisma:studio
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

## Deployment

### Docker (Recommended)

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_USER: verdant
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: verdant_point
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"

  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://verdant:secret@postgres:5432/verdant_point
      REDIS_HOST: redis
      REDIS_PORT: 6379
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
```

Deploy with:

```bash
docker-compose up -d
```

### AWS Deployment

1. **Database**: Use RDS PostgreSQL
2. **Cache**: Use ElastiCache Redis
3. **Application**: Deploy to ECS/EKS or EC2
4. **Load Balancer**: Use ALB for scaling
5. **Storage**: Use S3 for file uploads

### Environment Variables (Production)

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=<your-rds-connection-string>
REDIS_HOST=<your-elasticache-endpoint>
JWT_SECRET=<strong-random-secret>
CORS_ORIGIN=https://your-frontend-domain.com
```

## Performance Optimization

### Caching Strategy
- Product catalog cached for 1 hour
- User sessions cached until logout
- Settings cached for 1 hour

### Database Optimization
- All foreign keys indexed
- Frequent query fields indexed
- Connection pooling enabled
- Read replicas supported (future)

### Rate Limiting
- Default: 100 requests per 60 seconds
- Configurable via environment variables

## Security

### Authentication
- JWT tokens expire in 24 hours (configurable)
- Refresh tokens expire in 7 days
- PIN hashing using SHA-256 with secret

### Encryption
- Passwords: bcrypt with 12 rounds
- PII fields: AES-256 encryption
- HTTPS required in production

### Headers
- Helmet.js for security headers
- CORS configured per environment
- XSS protection enabled

## Monitoring

### Logging
- Winston logger with daily rotation
- Different log levels per environment
- Structured JSON logging in production

### Health Check
```bash
GET /api/v1/health
```

Returns:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "database": "connected",
    "api": "running"
  }
}
```

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
psql -U username -d verdant_point

# Verify connection string
echo $DATABASE_URL
```

### Redis Connection Issues
```bash
# Test Redis connection
redis-cli ping

# Check Redis is running
redis-cli info
```

### Migration Issues
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Generate Prisma client
npx prisma generate
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

Proprietary - Verdant Point Dispensary

## Support

For issues and questions:
- Create an issue in the repository
- Contact: tech@verdantpoint.com
