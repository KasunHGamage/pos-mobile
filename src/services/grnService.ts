import { ENDPOINTS } from '../config/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GRN {
  id: string;
  grnNumber: string;
  purchaseOrderId?: string;
  supplierId: string;
  supplierName: string;
  receivedDate: string;
  totalItems: number;
  totalValue: number;
  status: 'draft' | 'received' | 'verified' | 'invoiced';
}

export interface GRNBatch {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantityOrdered: number;
  quantityReceived: number;
  batchNumber?: string;
  expiryDate?: string;
  unitPrice: number;
  totalPrice: number;
}

export interface CreateGRNPayload {
  purchaseOrderId: string;
  receivedDate: string;
  notes?: string;
}

export interface CreateDirectGRNPayload {
  supplierId: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
    batchNumber?: string;
    expiryDate?: string;
  }[];
  receivedDate: string;
  notes?: string;
}

export interface GRNResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

// ─── GRN Service ──────────────────────────────────────────────────────────────

/** List all GRNs */
export async function getGRNList(token?: string): Promise<GRN[]> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(ENDPOINTS.grn.list, { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch GRNs (${response.status})`);
  }

  const data = await response.json();
  return data?.data || [];
}

/** Create GRN from Purchase Order */
export async function createGRN(
  payload: CreateGRNPayload,
  token?: string
): Promise<GRNResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(ENDPOINTS.grn.create, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message ?? `GRN creation failed (${response.status})`);
  }

  return data;
}

/** Create direct GRN without Purchase Order */
export async function createDirectGRN(
  payload: CreateDirectGRNPayload,
  token?: string
): Promise<GRNResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(ENDPOINTS.grn.direct, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message ?? `Direct GRN creation failed (${response.status})`);
  }

  return data;
}

/** Get GRN batch details */
export async function getGRNBatches(grnId: string, token?: string): Promise<GRNBatch[]> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(ENDPOINTS.grn.batches(grnId), { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch GRN batches (${response.status})`);
  }

  const data = await response.json();
  return data?.data || [];
}
