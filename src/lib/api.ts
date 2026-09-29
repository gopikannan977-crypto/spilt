import {
  AppNotification,
  AuditLog,
  DeterministicInsight,
  Expense,
  MoneySphere,
  PaymentRequest,
  Settlement,
  SphereBalancesResponse,
  User,
} from '../types';

const BASE_URL = '/api';

export function getStoredToken(): string | null {
  return localStorage.getItem('splitsphere_token');
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem('splitsphere_token', token);
  } else {
    localStorage.removeItem('splitsphere_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const json = await response.json();
  if (!response.ok || json.success === false) {
    const errorMsg = json.error?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return json.data;
}

export const api = {
  // Auth
  register: (data: { name: string; email: string; password: string }) =>
    request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    request<null>('/auth/logout', {
      method: 'POST',
    }),

  getMe: () =>
    request<{ user: User }>('/auth/me'),

  getDemoUsers: () =>
    request<User[]>('/auth/demo-users'),

  switchDemoUser: (userId: string) =>
    request<{ user: User; token: string }>('/auth/switch-demo', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),

  // Spheres
  getSpheres: () =>
    request<MoneySphere[]>('/spheres'),

  getSphere: (id: string) =>
    request<MoneySphere>(`/spheres/${id}`),

  createSphere: (data: {
    name: string;
    description?: string;
    category?: string;
    currency?: string;
    memberUserIds?: string[];
  }) =>
    request<MoneySphere>('/spheres', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateSphere: (id: string, data: Partial<MoneySphere>) =>
    request<MoneySphere>(`/spheres/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  addSphereMember: (sphereId: string, data: { email: string; name?: string }) =>
    request<any>(`/spheres/${sphereId}/members`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Expenses
  getSphereExpenses: (sphereId: string) =>
    request<Expense[]>(`/spheres/${sphereId}/expenses`),

  createExpense: (sphereId: string, data: any) =>
    request<Expense>(`/spheres/${sphereId}/expenses`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteExpense: (expenseId: string) =>
    request<{ id: string }>(`/expenses/${expenseId}`, {
      method: 'DELETE',
    }),

  // Balances & Settlements
  getSphereBalances: (sphereId: string) =>
    request<SphereBalancesResponse>(`/spheres/${sphereId}/balances`),

  getSphereSettlements: (sphereId: string) =>
    request<Settlement[]>(`/spheres/${sphereId}/settlements`),

  recordSettlement: (sphereId: string, data: any) =>
    request<Settlement>(`/spheres/${sphereId}/settlements`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Payment Requests
  getPaymentRequests: () =>
    request<PaymentRequest[]>('/payment-requests'),

  createPaymentRequest: (data: any) =>
    request<PaymentRequest>('/payment-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updatePaymentRequest: (id: string, data: { status: 'PAID' | 'REJECTED'; method?: string; referenceId?: string }) =>
    request<PaymentRequest>(`/payment-requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Notifications
  getNotifications: () =>
    request<AppNotification[]>('/notifications'),

  markNotificationRead: (id: string) =>
    request<AppNotification>(`/notifications/${id}/read`, {
      method: 'PATCH',
    }),

  markAllNotificationsRead: () =>
    request<void>('/notifications/read-all', {
      method: 'PATCH',
    }),

  // Analytics & Activity
  getDashboardAnalytics: () =>
    request<{
      netBalance: number;
      youAreOwed: number;
      youOwe: number;
      totalSpent: number;
      spheresCount: number;
      expensesCount: number;
      settlementsCount: number;
      insights: DeterministicInsight[];
      categoryDistribution: { category: string; amount: number }[];
      monthlySpending: { month: string; amount: number }[];
    }>('/dashboard/analytics'),

  getSphereAnalytics: (sphereId: string) =>
    request<any>(`/spheres/${sphereId}/analytics`),

  getActivity: () =>
    request<any[]>('/activity'),

  // Admin
  getAdminOverview: () =>
    request<{
      metrics: {
        totalUsers: number;
        totalSpheres: number;
        totalExpenses: number;
        totalSettlements: number;
        totalExpenseVolume: number;
        totalSettledVolume: number;
        pendingVolume: number;
      };
      auditLogs: AuditLog[];
    }>('/admin/overview'),

  getAdminUsers: () =>
    request<User[]>('/admin/users'),
};
