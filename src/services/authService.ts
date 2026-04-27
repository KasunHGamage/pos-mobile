import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENDPOINTS } from '../config/api';

// ─── Token Storage ────────────────────────────────────────────────────────────

const TOKEN_KEY = '@pos_auth_token';
const USER_KEY  = '@pos_auth_user';
const SHOP_KEY  = '@pos_auth_shop';

export async function saveAuthData(token: string, user: any, shop: any): Promise<void> {
  // Store specifically with the 'token' key as requested for the API interceptor
  await AsyncStorage.setItem('token', token);
  console.log("Saved token:", token);

  // Also maintain the old keys to avoid breaking legacy hooks temporarily
  await AsyncStorage.multiSet([
    [TOKEN_KEY, token],
    [USER_KEY,  JSON.stringify(user)],
    [SHOP_KEY,  JSON.stringify(shop)],
  ]);
}

export async function getToken(): Promise<string | null> {
  // Try the new explicit 'token' key first, fallback to TOKEN_KEY
  const t = await AsyncStorage.getItem('token');
  if (t) return t;
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function getStoredUser(): Promise<any | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function getStoredShop(): Promise<any | null> {
  const raw = await AsyncStorage.getItem(SHOP_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function clearAuthData(): Promise<void> {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY, SHOP_KEY]);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ShopData {
  name: string;
  registrationNumber?: string;
  ownerName?: string;
  address?: string;
  dealerCode?: string;
}

export interface RegisterPayload {
  phone:           string;
  password:        string;
  confirmPassword: string;
  shop:            ShopData;
}

export interface AuthResponse {
  token: string;
  user:  {
    id:    string;
    phone: string;
    role:  string;
  };
  shop: {
    id:                 string;
    name:               string;
    registrationNumber: string | null;
    ownerName:          string | null;
    address:            string | null;
    dealerCode:         string | null;
    subscriptionPlan:   string;
  } | null;
}

// ─── OTP ─────────────────────────────────────────────────────────────────────

export async function sendOtp(phone: string): Promise<void> {
  const response = await fetch(ENDPOINTS.auth.sendOtp, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ phone }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error ?? `Failed to send OTP (${response.status})`);
  }
}

export async function verifyOtp(phone: string, otp: string): Promise<void> {
  const response = await fetch(ENDPOINTS.auth.verifyOtp, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ phone, otp }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message ?? data?.error ?? `OTP verification failed (${response.status})`);
  }
  if (!data.verified) {
    throw new Error(data?.message ?? 'Invalid or expired OTP');
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function registerShop(payload: RegisterPayload): Promise<AuthResponse> {
  const response = await fetch(ENDPOINTS.auth.register, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error ?? data?.message ?? `Registration failed (${response.status})`);
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
    throw new Error(data?.error ?? data?.message ?? `Login failed (${response.status})`);
  }
  return data as AuthResponse;
}
