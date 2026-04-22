#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📱 Mobile POS - Frontend API Integration Guide
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Base URL: https://pos-backend-1-bnvk.onrender.com/api
 * Authentication: JWT Bearer Token (for protected routes)
 * 
 * This file documents all available API services and their usage.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 🔐 AUTHENTICATION SERVICE
 * ─────────────────────────────────────────────────────────────────────────────
 * 
 * Location: src/services/authService.ts
 * 
 * Functions:
 *   - registerShop(payload): Register a new shop
 *   - loginUser(phone, password): Authenticate user
 *   - getCurrentUser(token): Fetch current user details
 * 
 * Usage Example:
 * 
 *   import { registerShop, loginUser } from '@/services';
 *   
 *   // Register
 *   const response = await registerShop({
 *     shopName: 'My Shop',
 *     phone: '077123456',
 *     password: 'secure_password'
 *   });
 *   console.log(response.token); // JWT token
 * 
 *   // Login
 *   const loginRes = await loginUser('077123456', 'secure_password');
 *   console.log(loginRes.token);
 * 
 *   // Get Current User
 *   const user = await getCurrentUser(token);
 *   console.log(user);
 * 
 */

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 🛒 SALES SERVICE
 * ─────────────────────────────────────────────────────────────────────────────
 * 
 * Location: src/services/salesService.ts
 * 
 * Functions:
 *   - getSalesList(token): Get all sales
 *   - createSale(payload, token): Create new sale
 *   - getSaleDetail(id, token): Get sale details
 *   - downloadSaleInvoice(id, token): Download PDF invoice
 * 
 * Usage Example:
 * 
 *   import { getSalesList, createSale } from '@/services';
 *   
 *   // List all sales
 *   const sales = await getSalesList(userToken);
 * 
 *   // Create sale
 *   const newSale = await createSale({
 *     customerId: 'cust_123',
 *     items: [
 *       { productId: 'prod_1', quantity: 2, unitPrice: 100 },
 *       { productId: 'prod_2', quantity: 1, unitPrice: 50 }
 *     ],
 *     discount: 10,
 *     paymentMethod: 'cash',
 *     total: 240
 *   }, userToken);
 * 
 *   // Download invoice
 *   const pdf = await downloadSaleInvoice(sale.id, userToken);
 * 
 */

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 📦 INVENTORY SERVICE
 * ─────────────────────────────────────────────────────────────────────────────
 * 
 * Location: src/services/inventoryService.ts
 * 
 * Functions:
 *   - getInventoryList(token): List all products
 *   - getInventoryLogs(token): View inventory movement logs
 *   - adjustInventory(payload, token): Manually adjust stock
 *   - createInventoryItem(payload, token): Create new product
 *   - updateInventoryItem(id, payload, token): Update product
 *   - deleteInventoryItem(id, token): Delete product
 * 
 * Usage Example:
 * 
 *   import { getInventoryList, adjustInventory } from '@/services';
 *   
 *   // Get inventory
 *   const inventory = await getInventoryList(userToken);
 * 
 *   // Adjust stock
 *   await adjustInventory({
 *     productId: 'prod_123',
 *     quantity: 50,
 *     reason: 'Stock count correction'
 *   }, userToken);
 * 
 */

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 👥 CUSTOMER SERVICE
 * ─────────────────────────────────────────────────────────────────────────────
 * 
 * Location: src/services/customerService.ts
 * 
 * Functions:
 *   - getCustomerList(token): List all customers
 *   - createCustomer(payload, token): Add new customer
 *   - getCustomerDetail(id, token): Get customer details
 * 
 * Usage Example:
 * 
 *   import { getCustomerList, createCustomer } from '@/services';
 *   
 *   // List customers
 *   const customers = await getCustomerList(userToken);
 * 
 *   // Create customer
 *   await createCustomer({
 *     name: 'John Doe',
 *     phone: '077555666',
 *     email: 'john@example.com',
 *     creditLimit: 50000
 *   }, userToken);
 * 
 */

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 📊 ANALYTICS SERVICE
 * ─────────────────────────────────────────────────────────────────────────────
 * 
 * Location: src/services/analyticsService.ts
 * 
 * Functions:
 *   - getDashboardStats(token): Dashboard summary
 *   - getDailyAnalytics(startDate?, endDate?, token): Daily trends
 *   - getMonthlyAnalytics(year?, token): Monthly trends
 *   - getYearlyAnalytics(token): Yearly trends
 * 
 * Usage Example:
 * 
 *   import { getDashboardStats, getDailyAnalytics } from '@/services';
 *   
 *   // Get dashboard
 *   const stats = await getDashboardStats(userToken);
 *   console.log(stats.totalSales, stats.revenueToday);
 * 
 *   // Get daily trends
 *   const trends = await getDailyAnalytics('2024-01-01', '2024-01-31', userToken);
 * 
 */

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 🚚 SUPPLIER SERVICE
 * ─────────────────────────────────────────────────────────────────────────────
 * 
 * Location: src/services/supplierService.ts
 * 
 * Functions:
 *   - getSupplierList(token): List suppliers
 *   - createSupplier(payload, token): Add supplier
 *   - updateSupplier(id, payload, token): Update supplier
 *   - deleteSupplier(id, token): Delete supplier
 *   - getPurchaseOrderList(token): List purchase orders
 *   - createPurchaseOrder(payload, token): Create PO
 *   - confirmPurchaseOrder(id, token): Confirm PO
 *   - cancelPurchaseOrder(id, token): Cancel PO
 * 
 * Usage Example:
 * 
 *   import { getSupplierList, createPurchaseOrder } from '@/services';
 *   
 *   // List suppliers
 *   const suppliers = await getSupplierList(userToken);
 * 
 *   // Create purchase order
 *   await createPurchaseOrder({
 *     supplierId: 'supp_123',
 *     expectedDelivery: '2024-02-15',
 *     items: [
 *       { productId: 'prod_1', quantity: 100, unitPrice: 50 }
 *     ]
 *   }, userToken);
 * 
 */

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 📋 GRN SERVICE
 * ─────────────────────────────────────────────────────────────────────────────
 * 
 * Location: src/services/grnService.ts
 * 
 * Functions:
 *   - getGRNList(token): List all GRNs
 *   - createGRN(payload, token): Create GRN from PO
 *   - createDirectGRN(payload, token): Create direct GRN
 *   - getGRNBatches(grnId, token): Get GRN batch details
 * 
 * Usage Example:
 * 
 *   import { createDirectGRN, getGRNBatches } from '@/services';
 *   
 *   // Create direct GRN
 *   await createDirectGRN({
 *     supplierId: 'supp_123',
 *     items: [
 *       { productId: 'prod_1', quantity: 50, unitPrice: 100 }
 *     ],
 *     receivedDate: '2024-02-10'
 *   }, userToken);
 * 
 */

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ⚙️  SETTINGS SERVICE
 * ─────────────────────────────────────────────────────────────────────────────
 * 
 * Location: src/services/settingsService.ts
 * 
 * Functions:
 *   - getShopSettings(shopId, token): Get shop config
 *   - updateShopSettings(shopId, payload, token): Update settings
 *   - getShopUsage(shopId, token): Get usage metrics
 *   - getSubscriptionPlan(shopId, token): Get plan details
 *   - getAllShops(token): List all shops (admin)
 *   - createShop(payload, token): Create shop (admin)
 *   - updateShop(shopId, payload, token): Update shop (admin)
 *   - deleteShop(shopId, token): Delete shop (admin)
 * 
 * Usage Example:
 * 
 *   import { getShopSettings, updateShopSettings } from '@/services';
 *   
 *   // Get settings
 *   const settings = await getShopSettings(shopId, userToken);
 * 
 *   // Update settings
 *   await updateShopSettings(shopId, {
 *     shopName: 'Updated Shop Name',
 *     currency: 'USD'
 *   }, userToken);
 * 
 */

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 📱 USING HOOKS IN SCREENS (React Native)
 * ─────────────────────────────────────────────────────────────────────────────
 * 
 * Example: Fetch inventory in a screen
 * 
 *   import { useAuth } from '@/context/AuthContext';
 *   import { getInventoryList } from '@/services';
 *   import { useEffect, useState } from 'react';
 *   
 *   export default function InventoryScreen() {
 *     const { token } = useAuth();
 *     const [inventory, setInventory] = useState([]);
 *     const [loading, setLoading] = useState(true);
 *   
 *     useEffect(() => {
 *       async function loadInventory() {
 *         try {
 *           const data = await getInventoryList(token);
 *           setInventory(data);
 *         } catch (error) {
 *           console.error('Failed to load inventory:', error);
 *         } finally {
 *           setLoading(false);
 *         }
 *       }
 * 
 *       if (token) loadInventory();
 *     }, [token]);
 * 
 *     return (
 *       <View>
 *         {loading ? <ActivityIndicator /> : (
 *           <FlatList
 *             data={inventory}
 *             renderItem={({ item }) => <Text>{item.name}</Text>}
 *             keyExtractor={item => item.id}
 *           />
 *         )}
 *       </View>
 *     );
 *   }
 * 
 */

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 🔑 AUTHENTICATION FLOW
 * ─────────────────────────────────────────────────────────────────────────────
 * 
 * 1. User registers:
 *    => registerShop(payload)
 *    => Store token in AsyncStorage via AuthContext
 *    => Redirect to MainTabs
 * 
 * 2. User logs in:
 *    => loginUser(phone, password)
 *    => Store token in AsyncStorage via AuthContext
 *    => Redirect to MainTabs
 * 
 * 3. App restarts:
 *    => AuthContext.restoreToken() called in App.tsx
 *    => Checks AsyncStorage for token
 *    => If found: show MainTabs
 *    => If not found: show Login
 * 
 * 4. User logs out:
 *    => AuthContext.logout()
 *    => Clear AsyncStorage
 *    => Redirect to Login
 * 
 */

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ⚠️  ERROR HANDLING
 * ─────────────────────────────────────────────────────────────────────────────
 * 
 * All service functions throw errors with descriptive messages.
 * Always wrap service calls in try-catch:
 * 
 *   try {
 *     const result = await getSalesList(token);
 *   } catch (error) {
 *     console.error('API Error:', error.message);
 *     Alert.alert('Error', 'Failed to fetch sales');
 *   }
 * 
 */

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 📝 HTTP STATUS CODES
 * ─────────────────────────────────────────────────────────────────────────────
 * 
 * 200 OK - Success
 * 201 Created - Resource created
 * 400 Bad Request - Validation error
 * 401 Unauthorized - Missing/invalid token
 * 403 Forbidden - Insufficient permissions
 * 404 Not Found - Resource not found
 * 500 Internal Server Error - Server issue
 * 
 */

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 🚀 QUICK REFERENCE
 * ─────────────────────────────────────────────────────────────────────────────
 * 
 * Auth Context:
 *   import { useAuth } from '@/context/AuthContext';
 *   const { token, isAuthenticated, login, logout } = useAuth();
 * 
 * Services:
 *   import {
 *     getSalesList,
 *     getInventoryList,
 *     getCustomerList,
 *     getDashboardStats,
 *     // ... all other services
 *   } from '@/services';
 * 
 * API Config:
 *   import { ENDPOINTS, BASE_URL } from '@/config/api';
 *   console.log(ENDPOINTS.auth.login); // Full URL to login endpoint
 * 
 */

export {};
