import { ENDPOINTS } from '../config/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalSales: number;
  totalProducts: number;
  lowStockItems: number;
  totalCustomers: number;
  revenueToday: number;
  ordersToday: number;
  averageOrderValue: number;
}

export interface DailyTrend {
  date: string;
  sales: number;
  revenue: number;
  orders: number;
}

export interface MonthlyTrend {
  month: string;
  sales: number;
  revenue: number;
  orders: number;
}

export interface YearlyTrend {
  year: number;
  sales: number;
  revenue: number;
  orders: number;
  growth: number;
}

export interface AnalyticsResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// ─── Analytics Service ────────────────────────────────────────────────────────

/** Get dashboard summary statistics */
export async function getDashboardStats(token?: string): Promise<DashboardStats> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(ENDPOINTS.analytics.dashboard, { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard stats (${response.status})`);
  }

  const data = await response.json();
  return data?.data || data;
}

/** Get daily sales trends */
export async function getDailyAnalytics(
  startDate?: string,
  endDate?: string,
  token?: string
): Promise<DailyTrend[]> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const query = new URLSearchParams();
  if (startDate) query.append('startDate', startDate);
  if (endDate) query.append('endDate', endDate);

  const url = `${ENDPOINTS.analytics.daily}${query.toString() ? '?' + query.toString() : ''}`;
  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch daily analytics (${response.status})`);
  }

  const data = await response.json();
  return data?.data || [];
}

/** Get monthly sales trends */
export async function getMonthlyAnalytics(
  year?: number,
  token?: string
): Promise<MonthlyTrend[]> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const query = year ? `?year=${year}` : '';
  const response = await fetch(`${ENDPOINTS.analytics.monthly}${query}`, { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch monthly analytics (${response.status})`);
  }

  const data = await response.json();
  return data?.data || [];
}

/** Get yearly sales trends */
export async function getYearlyAnalytics(token?: string): Promise<YearlyTrend[]> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(ENDPOINTS.analytics.yearly, { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch yearly analytics (${response.status})`);
  }

  const data = await response.json();
  return data?.data || [];
}
