import { ENDPOINTS } from '../config/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SalesItem {
  id: string;
  date: string;
  customerName: string;
  total: number;
  items: number;
  status: 'completed' | 'pending' | 'failed';
}

export interface CreateSalesPayload {
  customerId?: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
  }[];
  discount?: number;
  paymentMethod: string;
  total: number;
}

export interface SalesResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

// ─── Sales Service ────────────────────────────────────────────────────────────

/** Retrieve all sales for the current shop */
export async function getSalesList(token?: string): Promise<SalesItem[]> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(ENDPOINTS.sales.list, { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch sales (${response.status})`);
  }

  const data = await response.json();
  return data?.data || [];
}

/** Create a new sale */
export async function createSale(
  payload: CreateSalesPayload,
  token?: string
): Promise<SalesResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(ENDPOINTS.sales.create, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message ?? `Sale creation failed (${response.status})`);
  }

  return data;
}

/** Get details for a specific sale */
export async function getSaleDetail(id: string, token?: string): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(ENDPOINTS.sales.detail(id), { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch sale details (${response.status})`);
  }

  const data = await response.json();
  return data?.data;
}

/** Download sale invoice as PDF */
export async function downloadSaleInvoice(id: string, token?: string): Promise<Blob> {
  const headers: Record<string, string> = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(ENDPOINTS.sales.pdf(id), { headers });

  if (!response.ok) {
    throw new Error(`Failed to download invoice (${response.status})`);
  }

  return response.blob();
}
