import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, registerShop, getStoredUser, getStoredShop, saveAuthData, clearAuthData, getToken } from '../services/authService';
import { ENDPOINTS } from '../config/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id:      string;
  phone:   string;
  role:    string;
  shop_id?: string;
}

export interface AuthShop {
  id:                  string;
  name:                string;
  registrationNumber?: string | null;
  ownerName?:          string | null;
  address?:            string | null;
  dealerCode?:         string | null;
  subscriptionPlan?:   string;
}

interface AuthContextType {
  token:      string | null;
  user:       AuthUser | null;
  shop:       AuthShop | null;
  isLoading:  boolean;
  isSignedIn: boolean;
  login:      (phone: string, password: string) => Promise<void>;
  logout:     () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

// ─── Context & Provider ───────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user,  setUser]  = useState<AuthUser | null>(null);
  const [shop,  setShop]  = useState<AuthShop | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Refresh session from Backend ──────────────────────────────────────────
  const refreshAuth = useCallback(async () => {
    const currentToken = await getToken();
    if (!currentToken) return;

    try {
      const response = await fetch(ENDPOINTS.auth.me, {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        // data usually follows buildAuthResponse structure: { user, shop }
        if (data.user) setUser(data.user);
        if (data.shop) setShop(data.shop);
        // Persist the refreshed data
        await saveAuthData(currentToken, data.user, data.shop);
      } else if (response.status === 401) {
        // Token expired
        await logout();
      }
    } catch (e) {
      console.warn('[AuthContext] Background refresh failed:', e);
    }
  }, []);

  // ── Restore session from AsyncStorage on app start ──────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [savedToken, savedUser, savedShop] = await Promise.all([
          getToken(),
          getStoredUser(),
          getStoredShop(),
        ]);
        if (savedToken) {
          setToken(savedToken);
          if (savedUser) setUser(savedUser);
          if (savedShop) setShop(savedShop);
          // Try to refresh from server in background
          refreshAuth();
        }
      } catch (e) {
        console.error('[AuthContext] Failed to restore session:', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [refreshAuth]);

  // ── Login ───────────────────────────────────────────────────────────────────
  const login = async (phone: string, password: string) => {
    const response = await loginUser(phone, password);
    await saveAuthData(response.token, response.user, response.shop);
    setToken(response.token);
    setUser(response.user as AuthUser);
    setShop(response.shop as AuthShop | null);
  };

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = async () => {
    await clearAuthData();
    setToken(null);
    setUser(null);
    setShop(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, shop, isLoading, isSignedIn: !!token, login, logout, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
