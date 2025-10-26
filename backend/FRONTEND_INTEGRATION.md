# Frontend-Backend Integration Guide

## Overview

This document explains how the Verdant Point frontend (React/Vite) integrates with the backend (NestJS) API, including data flow, state management, and real-time updates.

## Architecture Diagram

```
┌───────────────────────────────────────────────────────────────┐
│                     FRONTEND (React/Vite)                      │
│                      Port: 5173 (dev)                         │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              UI Components (shadcn/ui)              │    │
│  │  • POS Screen       • Kiosk Screen                  │    │
│  │  • Dashboard        • Inventory Management          │    │
│  │  • Reports          • Settings                      │    │
│  └────────────────┬────────────────────────────────────┘    │
│                   │                                          │
│  ┌────────────────▼────────────────────────────────────┐    │
│  │         State Management (TanStack Query)           │    │
│  │  • Data Fetching    • Caching                       │    │
│  │  • Mutations        • Optimistic Updates            │    │
│  └────────────────┬────────────────────────────────────┘    │
│                   │                                          │
│  ┌────────────────▼────────────────────────────────────┐    │
│  │              API Client (Axios)                     │    │
│  │  • Request Interceptors                             │    │
│  │  • Response Interceptors                            │    │
│  │  • Error Handling                                   │    │
│  └────────────────┬────────────────────────────────────┘    │
│                   │                                          │
│  ┌────────────────▼────────────────────────────────────┐    │
│  │          WebSocket Client (Socket.io)               │    │
│  │  • Real-time Inventory Updates                      │    │
│  │  • Live Sales Notifications                         │    │
│  │  • POS Synchronization                              │    │
│  └────────────────┬────────────────────────────────────┘    │
│                   │                                          │
└───────────────────┼──────────────────────────────────────────┘
                    │
      ┌─────────────┴─────────────┐
      │                           │
   HTTP/REST                 WebSocket
      │                           │
      │                           │
┌─────▼───────────────────────────▼─────┐
│         BACKEND (NestJS API)          │
│           Port: 3000                  │
├───────────────────────────────────────┤
│                                       │
│  ┌─────────────────────────────────┐ │
│  │  Controllers (REST Endpoints)   │ │
│  │  • Auth    • Sales              │ │
│  │  • Products • Customers          │ │
│  │  • Analytics • Compliance        │ │
│  └──────────┬──────────────────────┘ │
│             │                         │
│  ┌──────────▼──────────────────────┐ │
│  │  Services (Business Logic)      │ │
│  │  • Transaction Processing       │ │
│  │  • Inventory Management         │ │
│  │  • Analytics Computation        │ │
│  └──────────┬──────────────────────┘ │
│             │                         │
│  ┌──────────▼──────────────────────┐ │
│  │     Database Layer (Prisma)     │ │
│  │  • Query Builder                │ │
│  │  • Migrations                   │ │
│  │  • Type Safety                  │ │
│  └──────────┬──────────────────────┘ │
│             │                         │
│  ┌──────────▼──────────────────────┐ │
│  │     WebSocket Gateway           │ │
│  │  • Room Management              │ │
│  │  • Event Broadcasting           │ │
│  │  • Redis PubSub                 │ │
│  └──────────┬──────────────────────┘ │
│             │                         │
└─────────────┼─────────────────────────┘
              │
     ┌────────┴────────┐
     │                 │
┌────▼──────┐    ┌────▼──────┐
│PostgreSQL │    │   Redis   │
│  (Data)   │    │  (Cache)  │
└───────────┘    └───────────┘
```

## Data Flow Examples

### Example 1: POS Sale Transaction

```
USER ACTION: Cashier scans products and completes sale

1. Frontend → Backend
   POST /api/v1/sales
   {
     items: [{ productId, quantity }],
     customerId: "uuid",
     paymentMethod: "CASH"
   }

2. Backend Processing:
   a) Validate inventory availability
   b) Calculate totals and tax
   c) Create transaction in database
   d) Update inventory quantities
   e) Update customer loyalty points
   f) Log compliance event
   g) Emit WebSocket event

3. Backend → Frontend (HTTP Response)
   {
     success: true,
     data: {
       transactionNumber: "TXN-20240126-0001",
       total: 93.95,
       ...
     }
   }

4. Backend → All Clients (WebSocket)
   Event: 'inventory:updated'
   Event: 'sale:completed'

5. Frontend Updates:
   - Show receipt
   - Refresh inventory display
   - Update sales dashboard
   - Clear shopping cart
```

### Example 2: Real-time Inventory Sync

```
SCENARIO: Multiple POS terminals need live inventory updates

1. Terminal A sells product
   → Backend processes sale
   → Decreases inventory

2. Backend emits WebSocket event:
   socket.emit('inventory:updated', {
     productId: "uuid",
     quantity: 45,
     timestamp: "2024-01-26T10:30:00Z"
   })

3. All connected clients receive update:
   - Terminal B updates product display
   - Terminal C updates stock count
   - Kiosk updates availability

4. Frontend React component:
   useEffect(() => {
     socket.on('inventory:updated', (data) => {
       queryClient.setQueryData(['inventory', data.productId], {
         ...prev,
         quantity: data.quantity
       });
     });
   }, []);
```

## Frontend Integration Code

### 1. API Client Setup

Create `src/lib/api.ts`:

```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        localStorage.setItem('accessToken', response.data.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

### 2. WebSocket Connection

Create `src/lib/socket.ts`:

```typescript
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    this.socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: (data: any) => void) {
    this.socket?.on(event, callback);
  }

  emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }

  off(event: string) {
    this.socket?.off(event);
  }
}

export const socketService = new SocketService();
```

### 3. React Hooks for API Integration

Create `src/hooks/useAuth.ts`:

```typescript
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { socketService } from '@/lib/socket';

interface LoginCredentials {
  email: string;
  password: string;
}

interface PinCredentials {
  pin: string;
}

export function useAuth() {
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      return apiClient.post('/auth/login', credentials);
    },
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      // Connect WebSocket
      socketService.connect(data.data.accessToken);
    },
  });

  const pinLoginMutation = useMutation({
    mutationFn: async (credentials: PinCredentials) => {
      return apiClient.post('/auth/pin-login', credentials);
    },
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      socketService.connect(data.data.accessToken);
    },
  });

  const logout = () => {
    localStorage.clear();
    socketService.disconnect();
    window.location.href = '/login';
  };

  return {
    login: loginMutation.mutate,
    pinLogin: pinLoginMutation.mutate,
    logout,
    isLoading: loginMutation.isPending || pinLoginMutation.isPending,
  };
}
```

Create `src/hooks/useSales.ts`:

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

interface CreateSaleData {
  customerId?: string;
  items: Array<{
    productId: string;
    quantity: number;
    discount?: number;
  }>;
  paymentMethod: 'CASH' | 'DEBIT' | 'CREDIT';
  discountAmount?: number;
  registerId?: string;
}

export function useSales() {
  const queryClient = useQueryClient();

  const createSale = useMutation({
    mutationFn: async (saleData: CreateSaleData) => {
      return apiClient.post('/sales', saleData);
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  const getSales = useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      return apiClient.get('/sales');
    },
  });

  return {
    createSale: createSale.mutate,
    sales: getSales.data,
    isLoading: createSale.isPending || getSales.isLoading,
  };
}
```

Create `src/hooks/useProducts.ts`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export function useProducts(filters?: {
  categoryId?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.categoryId) params.append('categoryId', filters.categoryId);
      if (filters?.search) params.append('search', filters.search);

      return apiClient.get(`/products?${params.toString()}`);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      return apiClient.get(`/products/${id}`);
    },
    enabled: !!id,
  });
}
```

### 4. Real-time Updates Hook

Create `src/hooks/useRealtimeUpdates.ts`:

```typescript
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socketService } from '@/lib/socket';

export function useRealtimeUpdates() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Inventory updates
    socketService.on('inventory:updated', (data) => {
      queryClient.setQueryData(['inventory', data.productId], (old: any) => ({
        ...old,
        quantity: data.quantity,
      }));

      // Also invalidate products list
      queryClient.invalidateQueries({ queryKey: ['products'] });
    });

    // Sale completed
    socketService.on('sale:completed', (data) => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });

      // Show notification
      console.log('Sale completed:', data);
    });

    // Notifications
    socketService.on('notification:new', (data) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      // Show toast notification
      console.log('New notification:', data);
    });

    return () => {
      socketService.off('inventory:updated');
      socketService.off('sale:completed');
      socketService.off('notification:new');
    };
  }, [queryClient]);
}
```

### 5. React Component Example - POS Screen

```typescript
import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useSales } from '@/hooks/useSales';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';

export function POSScreen() {
  const [cart, setCart] = useState<Array<{ productId: string; quantity: number }>>([]);
  const { data: products, isLoading } = useProducts({ isActive: true });
  const { createSale } = useSales();

  // Enable real-time updates
  useRealtimeUpdates();

  const handleAddToCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const handleCheckout = async (paymentMethod: 'CASH' | 'DEBIT' | 'CREDIT') => {
    try {
      await createSale({
        items: cart,
        paymentMethod,
      });

      // Clear cart
      setCart([]);

      // Show success message
      alert('Sale completed!');
    } catch (error) {
      console.error('Sale failed:', error);
      alert('Sale failed. Please try again.');
    }
  };

  return (
    <div>
      {/* Product grid */}
      <div className="grid grid-cols-3 gap-4">
        {products?.data?.data.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAdd={() => handleAddToCart(product.id)}
          />
        ))}
      </div>

      {/* Shopping cart */}
      <Cart items={cart} onCheckout={handleCheckout} />
    </div>
  );
}
```

## Environment Variables

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_SOCKET_URL=http://localhost:3000
```

### Backend (.env)

```env
PORT=3000
CORS_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://...
REDIS_HOST=localhost
JWT_SECRET=your-secret
```

## Deployment Integration

### Production Setup

1. **Backend**: Deploy to AWS/GCP/Azure
2. **Frontend**: Build and serve static files
3. **Database**: Use managed PostgreSQL (RDS, Cloud SQL)
4. **Cache**: Use managed Redis (ElastiCache, MemoryStore)

### Environment Configuration

**Frontend Production**:
```env
VITE_API_URL=https://api.verdantpoint.com/api/v1
VITE_SOCKET_URL=https://api.verdantpoint.com
```

**Backend Production**:
```env
CORS_ORIGIN=https://app.verdantpoint.com,https://kiosk.verdantpoint.com
```

## Testing Integration

### API Integration Tests

```typescript
import { describe, it, expect } from 'vitest';
import { apiClient } from '@/lib/api';

describe('Sales API', () => {
  it('should create a sale', async () => {
    const saleData = {
      items: [{ productId: 'test-id', quantity: 1 }],
      paymentMethod: 'CASH',
    };

    const response = await apiClient.post('/sales', saleData);
    expect(response.success).toBe(true);
    expect(response.data.transactionNumber).toBeDefined();
  });
});
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS_ORIGIN matches frontend URL
2. **WebSocket not connecting**: Check JWT token is valid
3. **401 Errors**: Token may be expired, implement refresh logic
4. **Real-time updates not working**: Verify WebSocket connection established

## Best Practices

1. **Error Handling**: Always handle API errors gracefully
2. **Loading States**: Show loading indicators during API calls
3. **Optimistic Updates**: Update UI immediately, rollback on error
4. **Caching**: Use TanStack Query caching to reduce API calls
5. **WebSocket Reconnection**: Handle connection drops automatically
6. **Token Management**: Implement token refresh before expiry
7. **Rate Limiting**: Respect backend rate limits (100 req/min)

## Performance Optimization

1. **Cache product catalog** (5 min TTL)
2. **Debounce search queries** (300ms)
3. **Paginate large lists** (50 items per page)
4. **Lazy load images**
5. **Use WebSocket for live updates** instead of polling
6. **Implement request deduplication**

---

This integration enables a seamless, real-time experience across all POS terminals and kiosks while maintaining data consistency and compliance tracking.
