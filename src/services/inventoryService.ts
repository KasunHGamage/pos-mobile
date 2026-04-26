import { ENDPOINTS } from '../config/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  unit_type?: string;
  unit_options?: any;
  reorderLevel?: number;
}

export interface CreateInventoryPayload {
  name: string;
  sku: string;
  price: number;
  costPrice?: number;
  retailPrice?: number;
  discountPrice?: number;
  stock: number;
  category?: string;
  categoryId?: string;
  brand?: string;
  unit?: string;
  unit_type?: string;
  unit_options?: any;
}

export interface UpdateInventoryPayload {
  name?: string;
  category?: string;
  price?: number;
  stock?: number;
  unit?: string;
  unit_type?: string;
  unit_options?: any;
  reorderLevel?: number;
}

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reference: string;
  date: string;
  notes?: string;
}

export interface InventoryResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  costPrice: number | null;
  retailPrice: number | null;
  discountPrice: number | null;
  stock: number;
  shopId: string;
  category: string | null;
  categoryId: string | null;
  brand: string | null;
  unit: string | null;
  unit_type: string | null;
  unit_options: any | null;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Products ────────────────────────────────────────────────────────────────

export async function getProductsList(token?: string, search?: string): Promise<Product[]> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const url = search ? `${ENDPOINTS.products.list}?search=${encodeURIComponent(search)}` : ENDPOINTS.products.list;
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`Failed to fetch products (${response.status})`);
  const data = await response.json();
  return data || [];
}

export async function toggleFeaturedProduct(id: string, token?: string): Promise<Product> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await fetch(ENDPOINTS.products.toggleFeatured(id), { method: 'PATCH', headers });
  if (!response.ok) throw new Error(`Failed to toggle featured (${response.status})`);
  return response.json();
}

export async function saveProductChanges(
  id: string,
  payload: {
    name?: string; sku?: string; costPrice?: number; retailPrice?: number;
    discountPrice?: number; stock?: number; brand?: string; unit?: string;
    category?: string; categoryId?: string;
  },
  token?: string
): Promise<Product> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await fetch(ENDPOINTS.products.update(id), {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data?.error || `Failed to save product (${response.status})`);
  }
  return response.json();
}

/** List all products in inventory */
export async function getInventoryList(token?: string): Promise<InventoryItem[]> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(ENDPOINTS.inventory.list, { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch inventory (${response.status})`);
  }

  const data = await response.json();
  return data?.data || [];
}

/** Retrieve inventory movement logs */
export async function getInventoryLogs(token?: string): Promise<InventoryLog[]> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(ENDPOINTS.inventory.logs, { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch inventory logs (${response.status})`);
  }

  const data = await response.json();
  return data?.data || [];
}

/** Manually adjust inventory */
export async function adjustInventory(
  payload: { productId: string; quantity: number; reason: string },
  token?: string
): Promise<InventoryResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(ENDPOINTS.inventory.adjust, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message ?? `Inventory adjustment failed (${response.status})`);
  }

  return data;
}

/** Create a new inventory item (product) */
export async function createInventoryItem(
  payload: CreateInventoryPayload,
  token?: string
): Promise<InventoryResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(ENDPOINTS.products.create, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error ?? data?.message ?? `Item creation failed (${response.status})`);
  }

  return data;
}

/** Update an inventory item */
export async function updateInventoryItem(
  id: string,
  payload: UpdateInventoryPayload,
  token?: string
): Promise<InventoryResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(ENDPOINTS.products.update(id), {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message ?? `Item update failed (${response.status})`);
  }

  return data;
}

/** Delete an inventory item */
export async function deleteInventoryItem(
  id: string,
  token?: string
): Promise<InventoryResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(ENDPOINTS.products.delete(id), {
    method: 'DELETE',
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message ?? `Item deletion failed (${response.status})`);
  }

  return data;
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(token?: string): Promise<any[]> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(ENDPOINTS.categories.base, { headers });
  if (!response.ok) throw new Error(`Failed to fetch categories (${response.status})`);
  
  const data = await response.json();
  return data?.data || [];
}

export async function createCategoryApi(
  payload: { name: string; discount?: string; discountType?: string },
  token?: string
): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(ENDPOINTS.categories.base, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || `Failed to create category (${response.status})`);
  
  return data?.data;
}

export async function updateCategoryApi(
  id: string,
  payload: { name?: string; discount?: string; discountType?: string },
  token?: string
): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${ENDPOINTS.categories.base}/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || `Failed to update category (${response.status})`);
  return data?.data;
}

export async function deleteCategoryApi(
  id: string,
  token?: string
): Promise<void> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${ENDPOINTS.categories.base}/${id}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data?.message || `Failed to delete category (${response.status})`);
  }
}
