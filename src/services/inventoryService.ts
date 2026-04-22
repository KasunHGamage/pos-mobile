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
  reorderLevel?: number;
}

export interface CreateInventoryPayload {
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  reorderLevel?: number;
}

export interface UpdateInventoryPayload {
  name?: string;
  category?: string;
  price?: number;
  stock?: number;
  unit?: string;
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

// ─── Inventory Service ────────────────────────────────────────────────────────

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
    throw new Error(data?.message ?? `Item creation failed (${response.status})`);
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
