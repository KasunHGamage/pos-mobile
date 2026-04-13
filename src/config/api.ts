// ─── API Configuration ────────────────────────────────────────────────────────
// All base URLs and endpoint paths are managed here.
// To change the backend URL, update BASE_URL only.

export const BASE_URL = 'https://pos-backend-1-bnvk.onrender.com/api';

export const ENDPOINTS = {
  // Auth
  auth: {
    register: `${BASE_URL}/auth/register`,
    login:    `${BASE_URL}/auth/login`,
    logout:   `${BASE_URL}/auth/logout`,
  },

  // Sales
  sales: {
    list:   `${BASE_URL}/sales`,
    create: `${BASE_URL}/sales/create`,
    detail: (id: string) => `${BASE_URL}/sales/${id}`,
  },

  // Inventory
  inventory: {
    list:   `${BASE_URL}/inventory`,
    create: `${BASE_URL}/inventory/create`,
    update: (id: string) => `${BASE_URL}/inventory/${id}`,
    delete: (id: string) => `${BASE_URL}/inventory/${id}`,
  },

  // Customers
  customers: {
    list:   `${BASE_URL}/customers`,
    create: `${BASE_URL}/customers/create`,
    detail: (id: string) => `${BASE_URL}/customers/${id}`,
  },
} as const;
