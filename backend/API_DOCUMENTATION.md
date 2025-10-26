# Verdant Point POS - API Documentation

## Table of Contents
1. [Authentication](#authentication)
2. [Users](#users)
3. [Products](#products)
4. [Inventory](#inventory)
5. [Sales](#sales)
6. [Customers](#customers)
7. [Analytics](#analytics)
8. [Compliance](#compliance)
9. [Notifications](#notifications)
10. [Settings](#settings)
11. [WebSocket Events](#websocket-events)
12. [Error Handling](#error-handling)

---

## Authentication

### POST /api/v1/auth/login

Email/password authentication.

**Request:**
```json
{
  "email": "admin@verdantpoint.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "admin@verdantpoint.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "ADMIN"
    }
  }
}
```

### POST /api/v1/auth/pin-login

Quick PIN-based authentication for POS terminals.

**Request:**
```json
{
  "pin": "1234"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "admin@verdantpoint.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "ADMIN"
    }
  }
}
```

### POST /api/v1/auth/refresh

Refresh expired access token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## Products

### GET /api/v1/products

Get paginated list of products with optional filters.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 50)
- `sortBy` (string, optional): Field to sort by (default: createdAt)
- `sortOrder` (string, optional): asc or desc (default: desc)
- `categoryId` (string, optional): Filter by category
- `isActive` (boolean, optional): Filter active/inactive
- `search` (string, optional): Search by name or SKU

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "sku": "FLW-001",
        "name": "Blue Dream",
        "category": {
          "id": "uuid",
          "name": "Flower",
          "taxRate": 15.5
        },
        "strainType": "HYBRID",
        "thcPercentage": 23.5,
        "cbdPercentage": 0.5,
        "price": 45.00,
        "inventory": {
          "quantity": 100,
          "reorderLevel": 20
        }
      }
    ],
    "meta": {
      "total": 150,
      "page": 1,
      "limit": 50,
      "totalPages": 3,
      "hasMore": true
    }
  }
}
```

### POST /api/v1/products

Create new product.

**Permissions:** ADMIN, MANAGER, INVENTORY_CLERK

**Request:**
```json
{
  "sku": "FLW-003",
  "name": "Sour Diesel",
  "categoryId": "uuid",
  "supplierId": "uuid",
  "strainType": "SATIVA",
  "thcPercentage": 22.0,
  "cbdPercentage": 0.4,
  "batchId": "SD-2024-001",
  "metrcId": "METRC-SD-001",
  "price": 48.00,
  "cost": 26.00,
  "weightGrams": 3.5,
  "description": "Energizing sativa strain",
  "imageUrl": "https://...",
  "isActive": true
}
```

---

## Sales

### POST /api/v1/sales

Create new transaction (POS sale).

**Permissions:** ADMIN, MANAGER, BUDTENDER

**Request:**
```json
{
  "customerId": "uuid",
  "items": [
    {
      "productId": "uuid",
      "quantity": 2,
      "discount": 0
    },
    {
      "productId": "uuid",
      "quantity": 1,
      "discount": 5.00
    }
  ],
  "paymentMethod": "CASH",
  "discountAmount": 10.00,
  "registerId": "REG-001",
  "notes": "Customer paid with exact change"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "transactionNumber": "TXN-20240126-0001",
    "customer": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe"
    },
    "items": [
      {
        "product": {
          "name": "Blue Dream",
          "sku": "FLW-001"
        },
        "quantity": 2,
        "unitPrice": 45.00,
        "discount": 0,
        "total": 90.00
      }
    ],
    "subtotal": 90.00,
    "taxAmount": 13.95,
    "discountAmount": 10.00,
    "total": 93.95,
    "paymentMethod": "CASH",
    "paymentStatus": "COMPLETED",
    "createdAt": "2024-01-26T10:30:00.000Z"
  }
}
```

### GET /api/v1/sales

Get paginated transactions with filters.

**Query Parameters:**
- `page`, `limit`, `sortBy`, `sortOrder` (pagination)
- `userId` (string, optional): Filter by employee
- `customerId` (string, optional): Filter by customer
- `paymentStatus` (string, optional): COMPLETED, REFUNDED, VOID
- `startDate` (string, optional): Filter from date (ISO 8601)
- `endDate` (string, optional): Filter to date (ISO 8601)

### PATCH /api/v1/sales/:id/refund

Refund a transaction.

**Permissions:** ADMIN, MANAGER

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "transactionNumber": "TXN-20240126-0001",
    "paymentStatus": "REFUNDED",
    "updatedAt": "2024-01-26T11:00:00.000Z"
  }
}
```

---

## Inventory

### GET /api/v1/inventory/low-stock

Get products with low inventory levels.

**Permissions:** ADMIN, MANAGER, INVENTORY_CLERK

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "product": {
        "id": "uuid",
        "name": "Blue Dream",
        "sku": "FLW-001"
      },
      "quantity": 15,
      "reorderLevel": 20,
      "reorderQuantity": 50
    }
  ]
}
```

### PATCH /api/v1/inventory/:id

Update inventory levels.

**Request:**
```json
{
  "quantity": 150,
  "reorderLevel": 25,
  "expiryDate": "2025-06-30"
}
```

---

## Customers

### POST /api/v1/customers

Create new customer.

**Request:**
```json
{
  "email": "customer@example.com",
  "firstName": "Sarah",
  "lastName": "Johnson",
  "phone": "555-2000",
  "dateOfBirth": "1992-03-15",
  "medicalCardNumber": "MED-CA-67890",
  "medicalCardExpiry": "2025-12-31",
  "medicalCardState": "CA",
  "preferredContact": "EMAIL"
}
```

### GET /api/v1/customers/search?q=query

Search customers by name, email, or phone.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "firstName": "Sarah",
      "lastName": "Johnson",
      "email": "customer@example.com",
      "phone": "555-2000",
      "loyaltyPoints": 450,
      "totalSpent": 2500.00,
      "visitCount": 35
    }
  ]
}
```

---

## Analytics

### GET /api/v1/analytics/dashboard

Get comprehensive dashboard statistics.

**Query Parameters:**
- `startDate` (string, optional): Start date (ISO 8601)
- `endDate` (string, optional): End date (ISO 8601)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTransactions": 1250,
    "totalRevenue": 87500.00,
    "avgBasketSize": 70.00,
    "uniqueCustomers": 350,
    "topProducts": [
      {
        "product": {
          "name": "Blue Dream",
          "sku": "FLW-001"
        },
        "totalSold": 450,
        "totalRevenue": 20250.00,
        "transactionCount": 225
      }
    ],
    "topEmployees": [
      {
        "user": {
          "firstName": "John",
          "lastName": "Budtender"
        },
        "totalSales": 35000.00,
        "transactionCount": 500
      }
    ]
  }
}
```

### GET /api/v1/analytics/sales-over-time

Get sales trends over time.

**Query Parameters:**
- `startDate` (string, required)
- `endDate` (string, required)
- `interval` (string, optional): day, week, month (default: day)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-26",
      "total": 3500.00,
      "count": 50,
      "average": 70.00
    }
  ]
}
```

---

## Compliance

### GET /api/v1/compliance/logs

Get audit trail logs.

**Permissions:** ADMIN, MANAGER

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "eventType": "SALE",
        "user": {
          "firstName": "John",
          "lastName": "Budtender"
        },
        "entityType": "transaction",
        "entityId": "uuid",
        "action": "Sale completed - Transaction #TXN-20240126-0001",
        "afterState": {
          "total": 93.95,
          "paymentMethod": "CASH"
        },
        "ipAddress": "192.168.1.100",
        "createdAt": "2024-01-26T10:30:00.000Z"
      }
    ],
    "meta": {
      "total": 5000,
      "page": 1,
      "limit": 50,
      "totalPages": 100,
      "hasMore": true
    }
  }
}
```

### GET /api/v1/compliance/export

Export compliance report for regulatory submission.

**Query Parameters:**
- `startDate` (string, required)
- `endDate` (string, required)

**Response:**
```json
{
  "success": true,
  "data": {
    "reportDate": "2024-01-26T12:00:00.000Z",
    "period": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    },
    "totalEvents": 1500,
    "events": [...]
  }
}
```

---

## WebSocket Events

### Connection

Connect to: `ws://localhost:3000` or `wss://your-domain.com`

**Authentication:**
Send JWT token in connection query:
```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Events to Listen

#### inventory:updated
Triggered when inventory quantity changes.

```javascript
socket.on('inventory:updated', (data) => {
  console.log('Inventory updated:', data);
  // {
  //   productId: "uuid",
  //   quantity: 95,
  //   timestamp: "2024-01-26T10:30:00.000Z"
  // }
});
```

#### sale:completed
Triggered when a sale is completed.

```javascript
socket.on('sale:completed', (data) => {
  console.log('Sale completed:', data);
  // {
  //   transactionId: "uuid",
  //   total: 93.95,
  //   userId: "uuid",
  //   timestamp: "2024-01-26T10:30:00.000Z"
  // }
});
```

#### notification:new
Triggered when a new notification is created.

```javascript
socket.on('notification:new', (data) => {
  console.log('New notification:', data);
  // {
  //   userId: "uuid",
  //   notification: {
  //     type: "LOW_STOCK",
  //     title: "Low Stock Alert",
  //     message: "Blue Dream is running low",
  //     priority: "HIGH"
  //   },
  //   timestamp: "2024-01-26T10:30:00.000Z"
  // }
});
```

### Events to Emit

#### join-room
Join a specific room for targeted updates.

```javascript
socket.emit('join-room', 'register-1');
```

#### ping
Test connection.

```javascript
socket.emit('ping');
socket.on('pong', (data) => {
  console.log('Server responded:', data.timestamp);
});
```

---

## Error Handling

### Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "statusCode": 400,
  "timestamp": "2024-01-26T10:30:00.000Z",
  "path": "/api/v1/sales",
  "method": "POST",
  "message": "Validation failed",
  "errors": {
    "items": "items must be a non-empty array"
  }
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

### Common Error Messages

#### 401 Unauthorized
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Invalid credentials"
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "statusCode": 403,
  "message": "Insufficient permissions"
}
```

#### 400 Validation Error
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": {
    "email": "email must be a valid email address",
    "price": "price must be a positive number"
  }
}
```

---

## Rate Limiting

- Default: **100 requests per 60 seconds** per IP
- Exceeded limit returns `429 Too Many Requests`

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1706268000
```

---

## Frontend Integration Example

### React/TypeScript Integration

```typescript
import axios from 'axios';
import io from 'socket.io-client';

// API Client
const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// WebSocket Connection
const socket = io('http://localhost:3000', {
  auth: {
    token: localStorage.getItem('accessToken'),
  },
});

// Example: Create a sale
async function createSale(saleData) {
  try {
    const response = await apiClient.post('/sales', saleData);
    return response.data;
  } catch (error) {
    console.error('Sale failed:', error.response?.data);
    throw error;
  }
}

// Example: Listen for inventory updates
socket.on('inventory:updated', (data) => {
  // Update UI with new inventory levels
  updateInventoryDisplay(data.productId, data.quantity);
});
```

---

## Data Flow: Frontend ↔ Backend ↔ Database

```
┌─────────────────┐
│  React Frontend │
│  (Port 5173)    │
└────────┬────────┘
         │ HTTP/WebSocket
         ▼
┌─────────────────┐
│  NestJS API     │
│  (Port 3000)    │
│                 │
│ ┌─────────────┐ │
│ │ Controllers │ │◄─── HTTP Requests
│ └──────┬──────┘ │
│        ▼        │
│ ┌─────────────┐ │
│ │  Services   │ │◄─── Business Logic
│ └──────┬──────┘ │
│        ▼        │
│ ┌─────────────┐ │
│ │ Prisma ORM  │ │◄─── Database Operations
│ └──────┬──────┘ │
└────────┼────────┘
         │
         ▼
┌─────────────────┐       ┌─────────────┐
│   PostgreSQL    │       │    Redis    │
│   (Port 5432)   │       │ (Port 6379) │
│                 │       │             │
│  • Users        │       │  • Cache    │
│  • Products     │       │  • Sessions │
│  • Transactions │       │  • PubSub   │
│  • Inventory    │       └─────────────┘
│  • Customers    │
│  • Analytics    │
│  • Compliance   │
└─────────────────┘
```

---

## Next Steps

1. See [README.md](./README.md) for setup instructions
2. Review [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for data models
3. Test endpoints using Postman or curl
4. Integrate with frontend application
5. Configure METRC integration for compliance
