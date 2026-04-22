# 📱 Mobile POS - Backend API Integration

> Complete backend integration setup for the Mobile POS React Native application

## 📋 Overview

This project is integrated with a comprehensive backend API that handles:
- 🔐 **Authentication** - User registration, login, and JWT token management
- 🛒 **Sales** - POS transactions and invoice management
- 📦 **Inventory** - Product management and stock tracking
- 🚚 **Suppliers & Purchases** - Supplier management and purchase orders
- 📋 **GRN** - Goods Receiving Notes
- 📊 **Analytics** - Sales trends and dashboard insights
- ⚙️ **Settings** - Shop configuration and subscription management

---

## 🔗 API Base URL

```
https://pos-backend-1-bnvk.onrender.com/api
```

---

## 🗂️ Project Structure

```
src/
├── config/
│   └── api.ts                 # API endpoints configuration
├── services/                  # API service layer
│   ├── authService.ts         # Authentication
│   ├── salesService.ts        # Sales & checkout
│   ├── inventoryService.ts    # Products & inventory
│   ├── customerService.ts     # Customers (local, can map to backend)
│   ├── analyticsService.ts    # Dashboard & analytics
│   ├── grnService.ts          # Goods Receiving Notes
│   ├── supplierService.ts     # Suppliers & purchase orders
│   ├── settingsService.ts     # Shop settings & admin
│   └── index.ts               # Barrel export
├── context/
│   └── AuthContext.tsx        # Global auth state & token management
├── screens/                   # UI Screens
│   ├── LoginScreen.tsx        # Login (integrated)
│   ├── SignupScreen.tsx       # Registration (integrated)
│   ├── ProfileScreen.tsx      # Profile (integrated logout)
│   ├── POSHomeScreen.tsx      # Main POS screen
│   ├── SalesScreen.tsx        # Sales history
│   ├── InventoryScreen.tsx    # Inventory management
│   └── ... (other screens)
└── navigation/
    └── index.tsx              # Navigation with auth-aware routing
```

---

## 🔐 Authentication Flow

### 1. **Registration** (`LoginScreen` → Register)
```typescript
import { registerShop } from '@/services';

const response = await registerShop({
  shopName: 'My Store',
  phone: '077123456',
  password: 'securePassword123'
});
// Token automatically stored and user authenticated
```

### 2. **Login**
```typescript
import { loginUser } from '@/services';

const response = await loginUser('077123456', 'securePassword123');
// Token stored, redirect to MainTabs
```

### 3. **Token Persistence**
- Tokens are automatically saved to `AsyncStorage`
- On app restart, `AuthContext` restores the token
- If token exists → show MainTabs
- If token expired → redirect to Login

### 4. **Logout**
```typescript
const { logout } = useAuth();
await logout(); // Clears token and redirects to Login
```

---

## 📦 Services & Usage

### 🔑 Auth Service
```typescript
import { registerShop, loginUser, getCurrentUser } from '@/services';

// Register
const regResponse = await registerShop({...});

// Login
const loginResponse = await loginUser(phone, password);

// Get current user
const user = await getCurrentUser(token);
```

### 🛒 Sales Service
```typescript
import { getSalesList, createSale, getSaleDetail } from '@/services';

// List all sales
const sales = await getSalesList(token);

// Create sale
const newSale = await createSale({
  items: [...],
  discount: 10,
  paymentMethod: 'cash',
  total: 500
}, token);

// Get sale details
const detail = await getSaleDetail(saleId, token);
```

### 📦 Inventory Service
```typescript
import { 
  getInventoryList, 
  adjustInventory,
  createInventoryItem,
  updateInventoryItem
} from '@/services';

// List products
const inventory = await getInventoryList(token);

// Adjust stock
await adjustInventory({
  productId: 'prod_123',
  quantity: 50,
  reason: 'Stock correction'
}, token);

// Create product
await createInventoryItem({
  name: 'Product Name',
  sku: 'SKU001',
  price: 100,
  stock: 50
}, token);
```

### 👥 Customer Service
```typescript
import { getCustomerList, createCustomer } from '@/services';

const customers = await getCustomerList(token);

await createCustomer({
  name: 'John Doe',
  phone: '077123456',
  creditLimit: 50000
}, token);
```

### 📊 Analytics Service
```typescript
import { 
  getDashboardStats,
  getDailyAnalytics,
  getMonthlyAnalytics,
  getYearlyAnalytics
} from '@/services';

const stats = await getDashboardStats(token);
const daily = await getDailyAnalytics('2024-01-01', '2024-01-31', token);
const monthly = await getMonthlyAnalytics(2024, token);
const yearly = await getYearlyAnalytics(token);
```

### 🚚 Supplier Service
```typescript
import {
  getSupplierList,
  createSupplier,
  getPurchaseOrderList,
  createPurchaseOrder,
  confirmPurchaseOrder
} from '@/services';

const suppliers = await getSupplierList(token);
const orders = await getPurchaseOrderList(token);

await createPurchaseOrder({
  supplierId: 'supp_123',
  items: [...],
  expectedDelivery: '2024-02-15'
}, token);
```

### 📋 GRN Service
```typescript
import { createDirectGRN, getGRNBatches } from '@/services';

await createDirectGRN({
  supplierId: 'supp_123',
  items: [...],
  receivedDate: '2024-02-10'
}, token);
```

### ⚙️ Settings Service
```typescript
import { getShopSettings, updateShopSettings } from '@/services';

const settings = await getShopSettings(shopId, token);

await updateShopSettings(shopId, {
  shopName: 'New Name',
  currency: 'USD'
}, token);
```

---

## 🎯 Using Services in Screens

### Example: Load Inventory in a Screen

```typescript
import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, Text } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { getInventoryList } from '@/services';

export default function InventoryScreen() {
  const { token } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInventory() {
      try {
        const data = await getInventoryList(token);
        setInventory(data);
      } catch (error) {
        console.error('Failed to load inventory:', error);
        // Show error alert to user
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      loadInventory();
    }
  }, [token]);

  if (loading) return <ActivityIndicator />;

  return (
    <FlatList
      data={inventory}
      renderItem={({ item }) => (
        <View>
          <Text>{item.name}</Text>
          <Text>Stock: {item.stock}</Text>
        </View>
      )}
      keyExtractor={item => item.id}
    />
  );
}
```

---

## 🔌 Authentication via useAuth Hook

All screens can access authentication state:

```typescript
import { useAuth } from '@/context/AuthContext';

export default function MyScreen() {
  const { 
    isAuthenticated,  // boolean
    token,            // JWT token string
    user,             // User object
    login,            // async function
    logout,           // async function
    register          // async function
  } = useAuth();

  // Use these in your component
}
```

---

## 📡 API Endpoint Structure

All endpoints follow RESTful principles:

| Method | Endpoint             | Auth | Description                 |
|--------|----------------------|------|------------------------------|
| POST   | /auth/register       | ❌   | Register shop                |
| POST   | /auth/login          | ❌   | Login                        |
| GET    | /auth/me             | ✅   | Get current user             |
| GET    | /shop/products       | ✅   | List products                |
| POST   | /shop/products       | ✅   | Create product               |
| GET    | /shop/sales          | ✅   | List sales                   |
| POST   | /shop/sales          | ✅   | Create sale                  |
| GET    | /shop/inventory      | ✅   | List inventory               |
| POST   | /shop/inventory/adjust | ✅  | Adjust stock                 |
| GET    | /shop/dashboard/stats | ✅   | Dashboard statistics         |
| GET    | /shop/analytics/daily | ✅   | Daily trends                 |
| GET    | /shop/suppliers      | ✅   | List suppliers               |
| POST   | /shop/purchases      | ✅   | Create purchase order        |
| POST   | /shop/grn            | ✅   | Create GRN                   |
| GET    | /shop/settings/{id}  | ✅   | Get shop settings            |

---

## ⚠️ Error Handling

All service functions throw descriptive errors:

```typescript
try {
  const sales = await getSalesList(token);
} catch (error) {
  console.error('API Error:', error.message);
  Alert.alert('Error', 'Failed to fetch sales. Please try again.');
}
```

### HTTP Status Codes

| Code | Meaning                  |
|------|--------------------------|
| 200  | ✅ Success               |
| 201  | ✅ Created               |
| 400  | ⚠️ Bad Request           |
| 401  | 🔒 Unauthorized (no token) |
| 403  | 🚫 Forbidden (insufficient permissions) |
| 404  | ❌ Not Found             |
| 500  | 💥 Server Error          |

---

## 🔒 Authentication Header

All protected endpoints require JWT token in header:

```
Authorization: Bearer <your_jwt_token>
```

Services automatically add this header when token is provided.

---

## 📱 Dependencies

```json
{
  "@react-native-async-storage/async-storage": "^1.23.1",
  "@react-navigation/native": "^7.2.2",
  "@react-navigation/native-stack": "^7.14.10",
  "@react-navigation/bottom-tabs": "^7.15.9",
  "react-native-safe-area-context": "~5.6.0"
}
```

Install with:
```bash
npm install @react-native-async-storage/async-storage
```

---

## 🚀 Getting Started

1. **Ensure token is available in `useAuth()` hook**
   ```typescript
   const { token } = useAuth();
   ```

2. **Call service with token**
   ```typescript
   const data = await getInventoryList(token);
   ```

3. **Handle errors**
   ```typescript
   try {
     // service call
   } catch (error) {
     // handle error
   }
   ```

4. **Update UI with data**
   ```typescript
   setState(data);
   ```

---

## 📖 API Documentation

Full API documentation available at backend repository or contact backend team.

---

## 🐛 Common Issues

### **"Failed to fetch" error**
- Check network connectivity
- Verify BASE_URL is correct
- Ensure token is valid

### **"Unauthorized" (401)**
- Token might be expired
- Try logging in again
- Check AsyncStorage is working

### **CORS errors**
- Backend should handle CORS
- Contact backend team if headers missing

---

## 📞 Support

For issues or questions:
1. Check this guide
2. Review API_INTEGRATION_GUIDE.js
3. Check error messages
4. Contact backend team

---

**Last Updated:** April 2024  
**Status:** ✅ Production Ready
