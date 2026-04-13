import { ENDPOINTS } from '../config/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RegisterPayload {
  shopName: string;
  phone:    string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?:   string;
  user?:    Record<string, any>;
}

// ─── Auth Service ─────────────────────────────────────────────────────────────

export async function registerShop(payload: RegisterPayload): Promise<AuthResponse> {
  const response = await fetch(ENDPOINTS.auth.register, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    // Surface server-side error message if available
    throw new Error(data?.message ?? `Registration failed (${response.status})`);
  }

  return data as AuthResponse;
}

export async function loginUser(phone: string, password: string): Promise<AuthResponse> {
  const response = await fetch(ENDPOINTS.auth.login, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ phone, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message ?? `Login failed (${response.status})`);
  }

  return data as AuthResponse;
}
