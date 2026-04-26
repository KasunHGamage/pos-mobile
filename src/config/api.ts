// ─── API Configuration ────────────────────────────────────────────────────────
// All base URLs and endpoint paths are managed here.
// To change the backend URL, update BASE_URL only.

// Switch between local and production backend:
// LOCAL:      'http://192.168.x.x:8080/api'  ← your PC's local IP (for physical device)
// LOCAL SIM:  'http://10.0.2.2:8080/api'     ← Android emulator
export const BASE_URL = 'http://192.168.1.201:8080/api'; // ← Mac's current WiFi IP
// 192.168.56.1

export const ENDPOINTS = {
  auth: {
    sendOtp: `${BASE_URL}/auth/send-otp`,
    verifyOtp: `${BASE_URL}/auth/verify-otp`,
    register: `${BASE_URL}/auth/register`,
    login: `${BASE_URL}/auth/login`,
    me: `${BASE_URL}/auth/me`,
  },

  // Sales
  sales: {
    list: `${BASE_URL}/sales`,
    create: `${BASE_URL}/sales/create`,
    detail: (id: string) => `${BASE_URL}/sales/${id}`,
    pdf: (id: string) => `${BASE_URL}/sales/${id}/pdf`,
  },

  // Inventory & Products
  inventory: {
    list: `${BASE_URL}/inventory`,
    create: `${BASE_URL}/inventory/create`,
    update: (id: string) => `${BASE_URL}/inventory/${id}`,
    delete: (id: string) => `${BASE_URL}/inventory/${id}`,
    logs: `${BASE_URL}/inventory/logs`,
    adjust: `${BASE_URL}/inventory/adjust`,
  },
  products: {
    list: `${BASE_URL}/shop/products`,
    create: `${BASE_URL}/shop/products`,
    update: (id: string) => `${BASE_URL}/shop/products/${id}`,
    delete: (id: string) => `${BASE_URL}/shop/products/${id}`,
    toggleFeatured: (id: string) => `${BASE_URL}/shop/products/${id}/toggle-featured`,
  },
  categories: {
    base: `${BASE_URL}/shop/categories`,
  },

  // Customers
  customers: {
    list: `${BASE_URL}/customers`,
    create: `${BASE_URL}/customers/create`,
    detail: (id: string) => `${BASE_URL}/customers/${id}`,
  },

  // Analytics
  analytics: {
    dashboard: `${BASE_URL}/analytics/dashboard`,
    daily: `${BASE_URL}/analytics/daily`,
    monthly: `${BASE_URL}/analytics/monthly`,
    yearly: `${BASE_URL}/analytics/yearly`,
  },

  // GRN
  grn: {
    list: `${BASE_URL}/grn`,
    create: `${BASE_URL}/grn/create`,
    direct: `${BASE_URL}/grn/direct`,
    batches: (id: string) => `${BASE_URL}/grn/${id}/batches`,
  },

  // Settings
  shop: {
    base: `${BASE_URL}/shop`,
    settings: (id: string) => `${BASE_URL}/shop/${id}/settings`,
    updateSettings: (id: string) => `${BASE_URL}/shop/${id}/settings`,
    usage: (id: string) => `${BASE_URL}/shop/${id}/usage`,
    plan: (id: string) => `${BASE_URL}/shop/${id}/plan`,
  },
  admin: {
    shops: `${BASE_URL}/admin/shops`,
    updateShop: (id: string) => `${BASE_URL}/admin/shops/${id}`,
    deleteShop: (id: string) => `${BASE_URL}/admin/shops/${id}`,
    shopSettings: (id: string) => `${BASE_URL}/admin/shops/${id}/settings`,
  },

  // Suppliers & Purchases
  suppliers: {
    list: `${BASE_URL}/suppliers`,
    create: `${BASE_URL}/suppliers/create`,
    update: (id: string) => `${BASE_URL}/suppliers/${id}`,
    delete: (id: string) => `${BASE_URL}/suppliers/${id}`,
  },
  purchases: {
    list: `${BASE_URL}/purchases`,
    create: `${BASE_URL}/purchases/create`,
    confirm: (id: string) => `${BASE_URL}/purchases/${id}/confirm`,
    delete: (id: string) => `${BASE_URL}/purchases/${id}`,
  },
} as const;
