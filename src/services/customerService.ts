import { ENDPOINTS } from '../config/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  creditLimit?: number;
  creditUsed?: number;
}

export interface CreateCustomerPayload {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  creditLimit?: number;
}

export interface CustomerResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

// ─── Customer Service ─────────────────────────────────────────────────────────
// Note: Customer endpoints not explicitly listed in backend API docs.
// Using shop namespace convention for consistency.

/** Retrieve all customers */
export async function getCustomerList(token?: string): Promise<Customer[]> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${ENDPOINTS.shop.settings('').replace('/settings', '')}/customers`, { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch customers (${response.status})`);
  }

  const data = await response.json();
  return data?.data || [];
}

/** Create a new customer */
export async function createCustomer(
  payload: CreateCustomerPayload,
  token?: string
): Promise<CustomerResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${ENDPOINTS.shop.settings('').replace('/settings', '')}/customers`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message ?? `Customer creation failed (${response.status})`);
  }

  return data;
}

/** Get customer details */
export async function getCustomerDetail(id: string, token?: string): Promise<Customer> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${ENDPOINTS.shop.settings('').replace('/settings', '')}/customers/${id}`, { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch customer details (${response.status})`);
  }

  const data = await response.json();
  return data?.data;
}
