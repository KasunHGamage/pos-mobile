import { ENDPOINTS } from '../config/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  country: string;
  paymentTerms?: string;
  isActive: boolean;
}

export interface CreateSupplierPayload {
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  country: string;
  paymentTerms?: string;
}

export interface UpdateSupplierPayload {
  name?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  paymentTerms?: string;
  isActive?: boolean;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  createdDate: string;
  expectedDelivery: string;
  status: 'draft' | 'confirmed' | 'received' | 'cancelled';
  totalAmount: number;
  itemCount: number;
}

export interface CreatePurchaseOrderPayload {
  supplierId: string;
  expectedDelivery: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
  notes?: string;
}

export interface SupplierResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

// ─── Supplier Service ─────────────────────────────────────────────────────────

/** List all suppliers */
export async function getSupplierList(token?: string): Promise<Supplier[]> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(ENDPOINTS.suppliers.list, { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch suppliers (${response.status})`);
  }

  const data = await response.json();
  return data?.data || [];
}

/** Create a new supplier */
export async function createSupplier(
  payload: CreateSupplierPayload,
  token?: string
): Promise<SupplierResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(ENDPOINTS.suppliers.create, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message ?? `Supplier creation failed (${response.status})`);
  }

  return data;
}

/** Update supplier details */
export async function updateSupplier(
  id: string,
  payload: UpdateSupplierPayload,
  token?: string
): Promise<SupplierResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(ENDPOINTS.suppliers.update(id), {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message ?? `Supplier update failed (${response.status})`);
  }

  return data;
}

/** Delete a supplier */
export async function deleteSupplier(id: string, token?: string): Promise<SupplierResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(ENDPOINTS.suppliers.delete(id), {
    method: 'DELETE',
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message ?? `Supplier deletion failed (${response.status})`);
  }

  return data;
}

// ─── Purchase Order Service ───────────────────────────────────────────────────

/** List all purchase orders */
export async function getPurchaseOrderList(token?: string): Promise<PurchaseOrder[]> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(ENDPOINTS.purchases.list, { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch purchase orders (${response.status})`);
  }

  const data = await response.json();
  return data?.data || [];
}

/** Create a new purchase order */
export async function createPurchaseOrder(
  payload: CreatePurchaseOrderPayload,
  token?: string
): Promise<SupplierResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(ENDPOINTS.purchases.create, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message ?? `Purchase order creation failed (${response.status})`);
  }

  return data;
}

/** Confirm a purchase order */
export async function confirmPurchaseOrder(
  id: string,
  token?: string
): Promise<SupplierResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(ENDPOINTS.purchases.confirm(id), {
    method: 'PATCH',
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message ?? `Purchase order confirmation failed (${response.status})`);
  }

  return data;
}

/** Cancel/Delete a purchase order */
export async function cancelPurchaseOrder(
  id: string,
  token?: string
): Promise<SupplierResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(ENDPOINTS.purchases.delete(id), {
    method: 'DELETE',
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message ?? `Purchase order cancellation failed (${response.status})`);
  }

  return data;
}
