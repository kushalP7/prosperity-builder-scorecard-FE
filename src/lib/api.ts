import { Project, AppSettings, TemplateSection, AnalyticsWidget, DataRecord } from './types';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'project_lead' | 'assessment_specialist' | 'client_viewer';
  department?: string;
  status: 'active' | 'pending' | 'suspended';
  avatarBg?: string;
  lastActive?: string;
  assignedProjectsCount?: number;
  createdAt?: string;
}

const rawBase = (import.meta as any).env?.VITE_API_URL || (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) || 'http://localhost:3001';
const API_BASE = rawBase.replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '') + '/api/v1';

const ACCESS_TOKEN_KEY = 'rose_access_token';
const REFRESH_TOKEN_KEY = 'rose_refresh_token';

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

export const authStorage = {
  getAccessToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;
  },
  getRefreshToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;
  },
  setTokens(accessToken: string, refreshToken?: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      }
    }
  },
  clearTokens() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem('rose_auth_user');
    }
  },
};

async function attemptTokenRefresh(): Promise<string | null> {
  const refreshToken = authStorage.getRefreshToken();
  if (!refreshToken) return null;

  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        authStorage.clearTokens();
        return null;
      }

      const json = await res.json();
      if (json.data?.accessToken) {
        authStorage.setTokens(json.data.accessToken, json.data.refreshToken);
        if (json.data.user && typeof window !== 'undefined') {
          localStorage.setItem('rose_auth_user', JSON.stringify(json.data.user));
        }
        return json.data.accessToken;
      }
      return null;
    } catch {
      authStorage.clearTokens();
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 60000, retryOn401 = true): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  // Auto attach Bearer token
  const token = authStorage.getAccessToken();
  const headers = new Headers(options.headers || {});
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const response = await fetch(url, { ...options, headers, signal: controller.signal });
    clearTimeout(id);

    // If unauthorized, attempt seamless token refresh
    if (response.status === 401 && retryOn401 && !url.includes('/auth/login') && !url.includes('/auth/refresh')) {
      const newToken = await attemptTokenRefresh();
      if (newToken) {
        const retryHeaders = new Headers(options.headers || {});
        retryHeaders.set('Authorization', `Bearer ${newToken}`);
        return fetch(url, { ...options, headers: retryHeaders });
      }
    }

    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export const apiClient = {
  // Auth endpoints
  async login(email: string, password: string): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }, 15000, false);

      const json = await res.json();
      if (!res.ok || !json.data) {
        return { success: false, message: json?.error?.message || json?.message || 'Invalid email or password' };
      }

      authStorage.setTokens(json.data.accessToken, json.data.refreshToken);
      return { success: true, user: json.data.user };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network connection failed' };
    }
  },

  async register(data: { name: string; email: string; password: string; department?: string }): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }, 15000, false);

      const json = await res.json();
      if (!res.ok || !json.data) {
        return { success: false, message: json?.error?.message || json?.message || 'Registration failed' };
      }

      authStorage.setTokens(json.data.accessToken, json.data.refreshToken);
      return { success: true, user: json.data.user, message: json.message };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network connection failed' };
    }
  },

  async logout(): Promise<void> {
    try {
      await fetchWithTimeout(`${API_BASE}/auth/logout`, { method: 'POST' }, 5000, false);
    } catch {
      // Ignore network errors on logout
    } finally {
      authStorage.clearTokens();
    }
  },

  async getMe(): Promise<UserProfile | null> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/auth/me`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  },

  // Users Management (RBAC)
  async getUsers(search?: string): Promise<UserProfile[]> {
    try {
      const q = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await fetchWithTimeout(`${API_BASE}/users${q}`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async createUser(user: { name: string; email: string; password: string; role: string; department?: string; status?: string }): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      const json = await res.json();
      if (!res.ok) return { success: false, message: json?.error?.message || 'Failed to create user' };
      return { success: true, user: json.data, message: json.message };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  },

  async updateUser(id: string, updates: Partial<UserProfile & { password?: string }>): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (!res.ok) return { success: false, message: json?.error?.message || 'Failed to update user' };
      return { success: true, user: json.data, message: json.message };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  },

  async deleteUser(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/users/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      return { success: res.ok, message: json.message };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  },

  // Check API health
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/settings`, { method: 'GET' }, 2000);
      return res.ok;
    } catch {
      return false;
    }
  },

  // Projects
  async getProjects(): Promise<Project[] | null> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/projects`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch (err) {
      console.error('apiClient getProjects error:', err);
      return null;
    }
  },

  async createProject(project: Omit<Project, 'id' | 'assignedSections' | 'data'>): Promise<Project | null> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<boolean> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async deleteProject(id: string): Promise<boolean> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/projects/${id}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async assignSection(projectId: string, sectionId: string): Promise<boolean> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/projects/${projectId}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async updateProjectData(projectId: string, nodeId: string, columnId: string, data: DataRecord): Promise<boolean> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/projects/${projectId}/data`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: [{ nodeId, columnId, data }],
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Templates
  async getTemplates(): Promise<TemplateSection[] | null> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/templates`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  },

  async createSection(section: Partial<TemplateSection>): Promise<TemplateSection | null> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/templates/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(section),
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  },

  // Settings
  async getSettings(): Promise<AppSettings | null> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/settings`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  },

  async updateSettings(settings: AppSettings): Promise<boolean> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Analytics Widgets
  async getWidgets(): Promise<AnalyticsWidget[] | null> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/analytics/widgets`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  },

  // Sample Data Seed
  async loadSampleData(): Promise<boolean> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/seed/sample-data`, {
        method: 'POST',
      }, 120000);
      return res.ok;
    } catch (err) {
      console.error('apiClient loadSampleData error:', err);
      return false;
    }
  },
};
