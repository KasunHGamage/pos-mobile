import { ENDPOINTS } from '../config/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ShopSettings {
  id: string;
  shopName: string;
  businessType: string;
  taxNumber?: string;
  currency: string;
  timezone: string;
  receiptFormat: 'thermal' | 'a4';
  theme: string;
  language: string;
  notifications: {
    emailAlerts: boolean;
    lowStockAlert: boolean;
    salesAlert: boolean;
  };
}

export interface UpdateShopSettingsPayload {
  shopName?: string;
  businessType?: string;
  taxNumber?: string;
  currency?: string;
  timezone?: string;
  receiptFormat?: 'thermal' | 'a4';
  theme?: string;
  language?: string;
  notifications?: {
    emailAlerts?: boolean;
    lowStockAlert?: boolean;
    salesAlert?: boolean;
  };
}

export interface ShopUsage {
  shopId: string;
  totalSales: number;
  totalTransactions: number;
  activeProducts: number;
  storageUsed: number;
  monthlyTransactionLimit: number;
  transactionsUsedThisMonth: number;
}

export interface SubscriptionPlan {
  planId: string;
  planName: string;
  monthlyPrice: number;
  features: string[];
  transactionLimit: number;
  storageLimit: number;
  status: 'active' | 'inactive' | 'trial';
  expiryDate?: string;
}

export interface Shop {
  id: string;
  name: string;
  owner: string;
  email: string;
  phone: string;
  status: 'active' | 'suspended' | 'closed';
  createdDate: string;
  planId: string;
}

export interface ShopResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

// ─── Shop Settings Service ────────────────────────────────────────────────────

/** Get shop settings */
export async function getShopSettings(shopId: string, token?: string): Promise<ShopSettings> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(ENDPOINTS.shop.settings(shopId), { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch shop settings (${response.status})`);
  }

  const data = await response.json();
  return data?.data || data;
}

/** Update shop settings */
export async function updateShopSettings(
  shopId: string,
  payload: UpdateShopSettingsPayload,
  token?: string
): Promise<ShopResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(ENDPOINTS.shop.updateSettings(shopId), {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message ?? `Shop settings update failed (${response.status})`);
  }

  return data;
}

/** Get shop usage metrics */
export async function getShopUsage(shopId: string, token?: string): Promise<ShopUsage> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(ENDPOINTS.shop.usage(shopId), { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch shop usage (${response.status})`);
  }

  const data = await response.json();
  return data?.data || data;
}

/** Get subscription plan details */
export async function getSubscriptionPlan(shopId: string, token?: string): Promise<SubscriptionPlan> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(ENDPOINTS.shop.plan(shopId), { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch subscription plan (${response.status})`);
  }

  const data = await response.json();
  return data?.data || data;
}

// ─── Admin Service ────────────────────────────────────────────────────────────
// Note: These endpoints are admin-only and require admin JWT token

/** List all shops (admin only) */
export async function getAllShops(token?: string): Promise<Shop[]> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(ENDPOINTS.admin.shops, { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch shops (${response.status})`);
  }

  const data = await response.json();
  return data?.data || [];
}

/** Create a new shop (admin only) */
export async function createShop(
  payload: Omit<Shop, 'id' | 'createdDate'> & { password: string },
  token?: string
): Promise<ShopResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(ENDPOINTS.admin.shops, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message ?? `Shop creation failed (${response.status})`);
  }

  return data;
}

/** Update shop (admin only) */
export async function updateShop(
  shopId: string,
  payload: Partial<Shop>,
  token?: string
): Promise<ShopResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(ENDPOINTS.admin.updateShop(shopId), {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message ?? `Shop update failed (${response.status})`);
  }

  return data;
}

/** Delete/Suspend shop (admin only) */
export async function deleteShop(shopId: string, token?: string): Promise<ShopResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(ENDPOINTS.admin.deleteShop(shopId), {
    method: 'DELETE',
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message ?? `Shop deletion failed (${response.status})`);
  }

  return data;
}

/** Manage shop settings (admin only) */
export async function manageShopSettings(
  shopId: string,
  payload: UpdateShopSettingsPayload,
  token?: string
): Promise<ShopResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(ENDPOINTS.admin.shopSettings(shopId), {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message ?? `Admin settings update failed (${response.status})`);
  }

  return data;
}
