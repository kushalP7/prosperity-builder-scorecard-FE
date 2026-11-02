import { Project, AppSettings, TemplateSection, TemplateCategory, TemplateGroup, TemplateColumn, AnalyticsWidget, DataRecord } from './types';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'project_lead' | 'assessment_specialist' | 'customer';
  subscriptionStatus?: 'none' | 'active' | 'expired' | 'cancelled';
  subscriptionPackage?: string | null;
  subscribedAt?: string | null;
  subscriptionExpiresAt?: string | null;
  department?: string;
  status: 'active' | 'pending' | 'suspended';
  avatarBg?: string;
  avatarUrl?: string | null;
  lastActive?: string;
  assignedProjectsCount?: number;
  createdAt?: string;
}

const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:3001';
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

/** Shared fetch: attaches Bearer token and retries once after refresh on 401. */
export async function apiFetch(
  url: string,
  options: RequestInit = {},
  timeout = 60000,
  retryOn401 = true,
): Promise<Response> {
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

/** @deprecated Use apiFetch — kept as alias for existing call sites in this file. */
const fetchWithTimeout = apiFetch;

async function unpackJson(res: Response): Promise<any> {
  const json = await res.json();
  if (json && typeof json === 'object' && 'data' in json && json.success === true) {
    return json.data;
  }
  return json;
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

  async updateMyProfile(updates: {
    name?: string;
    avatarUrl?: string | null;
  }): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/auth/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: json?.error?.message || json?.message || 'Failed to update profile',
        };
      }
      return { success: true, user: json.data, message: json.message };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error' };
    }
  },

  // Users Management (RBAC)
  async getUsers(params?: {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: UserProfile[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null> {
    try {
      const q = new URLSearchParams();
      if (params?.search?.trim()) q.set('search', params.search.trim());
      if (params?.role && params.role !== 'all') q.set('role', params.role);
      if (params?.status && params.status !== 'all') q.set('status', params.status);
      if (params?.page) q.set('page', String(params.page));
      if (params?.limit) q.set('limit', String(params.limit));
      const qs = q.toString() ? `?${q.toString()}` : '';
      const res = await fetchWithTimeout(`${API_BASE}/users${qs}`);
      if (!res.ok) return null;
      const json = await res.json();
      const payload = json.data;
      if (payload && Array.isArray(payload.data)) {
        return {
          data: payload.data,
          total: typeof payload.total === 'number' ? payload.total : payload.data.length,
          page: typeof payload.page === 'number' ? payload.page : 1,
          limit: typeof payload.limit === 'number' ? payload.limit : params?.limit || 10,
          totalPages: typeof payload.totalPages === 'number' ? payload.totalPages : 1,
        };
      }
      // Legacy: bare array
      if (Array.isArray(payload)) {
        return {
          data: payload,
          total: payload.length,
          page: 1,
          limit: payload.length || 10,
          totalPages: 1,
        };
      }
      return null;
    } catch {
      return null;
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

  async setPasswordFromInvite(token: string, password: string): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/auth/set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      }, 15000, false);
      const json = await res.json();
      if (!res.ok || !json.data) {
        return { success: false, message: json?.error?.message || json?.message || 'Failed to set password' };
      }
      authStorage.setTokens(json.data.accessToken, json.data.refreshToken);
      return { success: true, user: json.data.user, message: json.message };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network connection failed' };
    }
  },

  async getInquiries(params?: {
    search?: string;
    leadRole?: string;
    status?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null> {
    try {
      const q = new URLSearchParams();
      if (params?.search?.trim()) q.set('search', params.search.trim());
      if (params?.leadRole && params.leadRole !== 'all') q.set('leadRole', params.leadRole);
      if (params?.status && params.status !== 'all') q.set('status', params.status);
      if (params?.page) q.set('page', String(params.page));
      if (params?.limit) q.set('limit', String(params.limit));
      if (params?.sortBy) q.set('sortBy', params.sortBy);
      if (params?.sortDir) q.set('sortDir', params.sortDir);
      const qs = q.toString() ? `?${q.toString()}` : '';
      const res = await fetchWithTimeout(`${API_BASE}/inquiries${qs}`);
      if (!res.ok) return null;
      const json = await res.json();
      const payload = json.data;
      if (payload && Array.isArray(payload.data)) {
        return {
          data: payload.data,
          total: typeof payload.total === 'number' ? payload.total : payload.data.length,
          page: typeof payload.page === 'number' ? payload.page : 1,
          limit: typeof payload.limit === 'number' ? payload.limit : params?.limit || 10,
          totalPages: typeof payload.totalPages === 'number' ? payload.totalPages : 1,
        };
      }
      if (Array.isArray(payload)) {
        return { data: payload, total: payload.length, page: 1, limit: payload.length || 10, totalPages: 1 };
      }
      return null;
    } catch {
      return null;
    }
  },

  async sendInquiryPortalAccess(id: string): Promise<{ success: boolean; alreadyRegistered?: boolean; message?: string }> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/inquiries/${id}/send-portal-access`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, message: json?.error?.message || json?.message || 'Failed to send portal access' };
      }
      const data = json.data || json;
      return {
        success: true,
        alreadyRegistered: Boolean(data.alreadyRegistered),
        message: data.message || json.message,
      };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  },

  async resendInquiryLogin(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/inquiries/${id}/resend-login`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, message: json?.error?.message || json?.message || 'Failed to resend login email' };
      }
      const data = json.data || json;
      return { success: true, message: data.message || json.message };
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
  async getProjects(params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<any | null> {
    try {
      const q = new URLSearchParams();
      if (params?.search && params.search.trim()) q.set('search', params.search.trim());
      if (params?.status && params.status !== 'all') q.set('status', params.status);
      if (params?.page) q.set('page', String(params.page));
      if (params?.limit) q.set('limit', String(params.limit));
      const qs = q.toString() ? `?${q.toString()}` : '';
      const res = await fetchWithTimeout(`${API_BASE}/projects${qs}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch (err) {
      console.error('apiClient getProjects error:', err);
      return null;
    }
  },

  async getProject(id: string): Promise<Project | null> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/projects/${id}`);
      if (!res.ok) return null;
      return await unpackJson(res);
    } catch (err) {
      console.error(`apiClient getProject(${id}) error:`, err);
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

  async restoreProject(id: string): Promise<boolean> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/projects/${id}/restore`, {
        method: 'POST',
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Upload image to backend upload service
  async uploadImage(file: File, folder: string = 'projects'): Promise<{ url: string; public_id?: string; format?: string; bytes?: number; originalName?: string } | null> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetchWithTimeout(`${API_BASE}/uploads/image?folder=${encodeURIComponent(folder)}`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        return null;
      }
      return await unpackJson(res);
    } catch (err) {
      console.error('apiClient uploadImage error:', err);
      return null;
    }
  },

  /** Upload PDF/document (used by scorecard publish / replace report). */
  async uploadFile(
    file: File,
    folder: string = 'projects',
  ): Promise<{ url: string; public_id?: string; format?: string; bytes?: number; originalName?: string } | null> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetchWithTimeout(
        `${API_BASE}/uploads/file?folder=${encodeURIComponent(folder)}`,
        {
          method: 'POST',
          body: formData,
        },
        120000,
      );

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        const message =
          json?.error?.message || json?.message || `Upload failed (${res.status})`;
        throw new Error(message);
      }
      return await unpackJson(res);
    } catch (err) {
      console.error('apiClient uploadFile error:', err);
      throw err;
    }
  },

  async assignSections(projectId: string, sectionIds: string[]): Promise<any> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/projects/${projectId}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionIds }),
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  },

  async assignSection(projectId: string, sectionId: string): Promise<any> {
    return this.assignSections(projectId, [sectionId]);
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

  async getLicensedEmptyMetrics(projectId: string): Promise<any> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/projects/${projectId}/licensed-empty`);
      if (!res.ok) return null;
      return await unpackJson(res);
    } catch {
      return null;
    }
  },

  async importLicensedData(
    projectId: string,
    payload: {
      provider: 'ESRI' | 'COSTAR' | 'MOODYS_CRE'
      rows: Array<{ metricLabel?: string; nodeId?: string; value: string; notes?: string }>
    },
  ): Promise<any> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/projects/${projectId}/licensed-import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error?.message || err?.message || 'Licensed import failed');
      }
      return await unpackJson(res);
    } catch (e) {
      throw e;
    }
  },

  async recalculateProject(id: string): Promise<any> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/projects/${id}/recalculate`, {
        method: 'POST',
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
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

  async updateSection(id: string, section: Partial<TemplateSection>): Promise<boolean> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/templates/sections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(section),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async deleteSection(id: string): Promise<boolean> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/templates/sections/${id}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async publishSectionVersion(id: string, changelog?: string): Promise<TemplateSection | null> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/templates/sections/${id}/publish-version`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changelog }),
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  },

  async getSectionVersions(id: string): Promise<TemplateSection[] | null> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/templates/sections/${id}/versions`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  },

  async createCategory(sectionId: string, category: any): Promise<TemplateCategory | null> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/templates/sections/${sectionId}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  },

  async updateCategory(id: string, category: any): Promise<boolean> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/templates/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async deleteCategory(id: string): Promise<boolean> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/templates/categories/${id}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async createGroup(categoryId: string, group: any): Promise<TemplateGroup | null> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/templates/categories/${categoryId}/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(group),
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  },

  async updateGroup(id: string, group: any): Promise<boolean> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/templates/groups/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(group),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async deleteGroup(id: string): Promise<boolean> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/templates/groups/${id}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async createColumn(sectionIdOrCategoryId: string, groupId: string | null, column: any): Promise<TemplateColumn | null> {
    try {
      const url = `${API_BASE}/templates/sections/${sectionIdOrCategoryId}/columns`;
      const res = await fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(column),
      });
      if (!res.ok) {
        const catUrl = groupId
          ? `${API_BASE}/templates/categories/${sectionIdOrCategoryId}/columns?groupId=${groupId}`
          : `${API_BASE}/templates/categories/${sectionIdOrCategoryId}/columns`;
        const resCat = await fetchWithTimeout(catUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(column),
        });
        if (!resCat.ok) return null;
        const catJson = await resCat.json();
        return catJson.data || null;
      }
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  },

  async updateColumn(id: string, column: any): Promise<boolean> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/templates/columns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(column),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async deleteColumn(id: string): Promise<boolean> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/templates/columns/${id}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch {
      return false;
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
      const payload: any = {
        companyName: settings.companyProfile?.name || 'Rose Associates',
        companyAddress: settings.companyProfile?.address,
        companyPhone: settings.companyProfile?.phone,
        companyLogoUrl: settings.companyProfile?.logoUrl,
        companyProfile: settings.companyProfile,
        ratingBands: settings.ratingBands,
        planPrices: settings.planPrices,
      };
      const res = await fetchWithTimeout(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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

  // --- Orders & Payments (shared Orders API; full upfront package pay) ---
  async getOrderPackages(): Promise<Array<{
    id: string;
    packageType: 'scorecard_only' | 'subscription' | 'combined';
    name: string;
    description: string;
    amount: number;
    currency: string;
  }>> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/orders/packages`);
      if (!res.ok) return [];
      return (await unpackJson(res)) || [];
    } catch {
      return [];
    }
  },

  async getPaymentConfig(): Promise<{
    provider: 'stripe' | 'stub';
    requested: 'stripe' | 'stub';
    stripeConfigured: boolean;
    stubAllowed: boolean;
    message?: string;
  } | null> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/orders/payment-config`);
      if (!res.ok) return null;
      return await unpackJson(res);
    } catch {
      return null;
    }
  },

  async getOrders(params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    summary?: any;
  } | null> {
    try {
      const qs = new URLSearchParams();
      if (params?.status && params.status !== 'all') qs.set('status', params.status);
      if (params?.search?.trim()) qs.set('search', params.search.trim());
      if (params?.page) qs.set('page', String(params.page));
      if (params?.limit) qs.set('limit', String(params.limit));
      const q = qs.toString();
      const res = await fetchWithTimeout(`${API_BASE}/orders${q ? `?${q}` : ''}`);
      if (!res.ok) return null;
      const payload = await unpackJson(res);
      if (payload && Array.isArray(payload.data)) {
        return {
          data: payload.data,
          total: typeof payload.total === 'number' ? payload.total : payload.data.length,
          page: typeof payload.page === 'number' ? payload.page : 1,
          limit: typeof payload.limit === 'number' ? payload.limit : params?.limit || 5,
          totalPages: typeof payload.totalPages === 'number' ? payload.totalPages : 1,
          summary: payload.summary,
        };
      }
      if (Array.isArray(payload)) {
        return {
          data: payload,
          total: payload.length,
          page: 1,
          limit: payload.length || 5,
          totalPages: 1,
        };
      }
      return null;
    } catch {
      return null;
    }
  },

  async getMyOrders(): Promise<any[]> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/orders/mine`);
      if (!res.ok) return [];
      return (await unpackJson(res)) || [];
    } catch {
      return [];
    }
  },

  async getMyPayments(): Promise<any[]> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/orders/mine/payments`);
      if (!res.ok) return [];
      return (await unpackJson(res)) || [];
    } catch {
      return [];
    }
  },

  async getMyProjectAllowance(): Promise<{
    maxProjects: number;
    usedProjects: number;
    remaining: number;
    paidPackages: any[];
  } | null> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/orders/mine/allowance`);
      if (!res.ok) return null;
      return await unpackJson(res);
    } catch {
      return null;
    }
  },

  async getOrder(id: string): Promise<any | null> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/orders/${id}`);
      if (!res.ok) return null;
      return await unpackJson(res);
    } catch {
      return null;
    }
  },

  async createOrder(payload: {
    packageType: 'scorecard_only' | 'subscription' | 'combined';
    customerName: string;
    organization?: string;
    checkoutMethod?: 'card' | 'invoice';
  }): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, message: json?.message || json?.error?.message || 'Failed to create order' };
      }
      return { success: true, data: json.data ?? json };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error' };
    }
  },

  async createPaymentIntent(
    orderId: string,
  ): Promise<{ success: boolean; data?: { clientSecret: string; paymentIntentId: string; amount?: number }; message?: string }> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/orders/${orderId}/payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: json?.message || json?.error?.message || 'Could not start Stripe payment',
        };
      }
      return { success: true, data: json.data ?? json };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error' };
    }
  },

  async confirmStripePayment(
    orderId: string,
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/orders/${orderId}/confirm-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: json?.message || json?.error?.message || 'Could not confirm payment',
          data: json?.data,
        };
      }
      return { success: true, data: json.data ?? json, message: json.message };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error' };
    }
  },

  async stubPayOrder(
    orderId: string,
    payload: { cardNumber: string; expiry: string; cvc: string; cardholderName?: string; forceFail?: boolean },
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/orders/${orderId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          cardNumber: String(payload.cardNumber || '').replace(/\D/g, ''),
        }),
      });
      const json = await res.json();
      if (!res.ok || json.success === false) {
        const nested = typeof json?.message === 'object' && json.message ? json.message : null;
        return {
          success: false,
          message: nested?.message || (typeof json?.message === 'string' ? json.message : null) || 'Payment failed',
          data: nested?.data ?? json?.data,
        };
      }
      return { success: true, data: json.data ?? json, message: json.message };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error' };
    }
  },

  async downloadPaymentReceipt(
    orderId: string,
    attemptId: string,
  ): Promise<{ success: boolean; blob?: Blob; filename?: string; message?: string }> {
    try {
      const res = await fetchWithTimeout(
        `${API_BASE}/orders/${encodeURIComponent(orderId)}/receipts/${encodeURIComponent(attemptId)}`,
      );
      if (!res.ok) {
        let message = 'Could not download receipt PDF';
        try {
          const json = await res.json();
          message = json?.message || json?.error?.message || message;
        } catch {
          /* binary error body */
        }
        return { success: false, message };
      }
      const blob = await res.blob();
      const disposition = res.headers.get('Content-Disposition') || '';
      const match = /filename="?([^";]+)"?/i.exec(disposition);
      return {
        success: true,
        blob,
        filename: match?.[1] || `Receipt-${orderId}.pdf`,
      };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error' };
    }
  },

  async markOrderPaid(
    orderId: string,
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/orders/${orderId}/mark-paid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: json?.message || json?.error?.message || 'Could not mark order as paid',
        };
      }
      return { success: true, data: json.data ?? json, message: json.message };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error' };
    }
  },

  async refundOrder(orderId: string): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/orders/${orderId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, message: json?.message || 'Refund failed' };
      }
      return { success: true, data: json.data ?? json, message: json.message };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error' };
    }
  },

  async sendOrderProjectReport(
    orderId: string,
    projectId: string,
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const res = await fetchWithTimeout(
        `${API_BASE}/orders/${orderId}/projects/${projectId}/send-report`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
      );
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        return {
          success: false,
          message: json?.message || 'Failed to send scorecard report email',
        };
      }
      return { success: true, data: json?.data ?? json, message: json?.message };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error' };
    }
  },

  async sendOrderPaymentReminder(
    orderId: string,
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/orders/${orderId}/send-reminder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        return {
          success: false,
          message: json?.message || 'Failed to send payment reminder email',
        };
      }
      return { success: true, data: json?.data ?? json, message: json?.message };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error' };
    }
  },

  async getPaymentLedger(params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    summary?: any;
  } | null> {
    try {
      const qs = new URLSearchParams();
      if (params?.status && params.status !== 'all') qs.set('status', params.status);
      if (params?.search?.trim()) qs.set('search', params.search.trim());
      if (params?.page) qs.set('page', String(params.page));
      if (params?.limit) qs.set('limit', String(params.limit));
      const q = qs.toString();
      const res = await fetchWithTimeout(`${API_BASE}/orders/payments${q ? `?${q}` : ''}`);
      if (!res.ok) return null;
      const payload = await unpackJson(res);
      if (payload && Array.isArray(payload.data)) {
        return {
          data: payload.data,
          total: typeof payload.total === 'number' ? payload.total : payload.data.length,
          page: typeof payload.page === 'number' ? payload.page : 1,
          limit: typeof payload.limit === 'number' ? payload.limit : params?.limit || 10,
          totalPages: typeof payload.totalPages === 'number' ? payload.totalPages : 1,
          summary: payload.summary,
        };
      }
      if (Array.isArray(payload)) {
        return {
          data: payload,
          total: payload.length,
          page: 1,
          limit: payload.length || 10,
          totalPages: 1,
        };
      }
      return null;
    } catch {
      return null;
    }
  },

  // --- Phase 1: Milestone Payments & Bypass (admin/legacy; customer path uses Orders) ---
  async getProjectMilestones(projectId: string): Promise<any> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/payments/project/${projectId}`);
      if (!res.ok) return null;
      return await unpackJson(res);
    } catch {
      return null;
    }
  },

  async advanceMilestone(projectId: string, milestoneType: string): Promise<any> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/payments/project/${projectId}/advance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestoneType }),
      });
      if (!res.ok) return null;
      return await unpackJson(res);
    } catch {
      return null;
    }
  },

  async toggleBypass(projectId: string, bypass: boolean): Promise<any> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/payments/project/${projectId}/toggle-bypass`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bypass }),
      });
      if (!res.ok) return null;
      return await unpackJson(res);
    } catch {
      return null;
    }
  },

  // --- Phase 2: Client Intake & Questionnaire ---
  async getQuestionnaireDefinition(): Promise<any> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/intake/definition`);
      if (!res.ok) return null;
      return await unpackJson(res);
    } catch {
      return null;
    }
  },

  async getQuestionnaireSubmission(projectId: string): Promise<any> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/intake/project/${projectId}`);
      if (!res.ok) return null;
      return await unpackJson(res);
    } catch {
      return null;
    }
  },

  async saveQuestionnaireDraft(projectId: string, answers: Record<string, any>): Promise<any> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/intake/project/${projectId}/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) return null;
      return await unpackJson(res);
    } catch {
      return null;
    }
  },

  async submitQuestionnaire(projectId: string, answers?: Record<string, any>): Promise<any> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/intake/project/${projectId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answers || {} }),
      });
      if (!res.ok) return null;
      return await unpackJson(res);
    } catch {
      return null;
    }
  },

  // --- Phase 2: Automated API Ingestion & Staging ---
  async getStagedData(projectId: string): Promise<any> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/ingestion/project/${projectId}`);
      if (!res.ok) return null;
      return await unpackJson(res);
    } catch {
      return null;
    }
  },

  async triggerIngestion(projectId: string): Promise<any> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/ingestion/project/${projectId}/trigger`, {
        method: 'POST',
      });
      if (!res.ok) return null;
      return await unpackJson(res);
    } catch {
      return null;
    }
  },

  // --- Phase 3 & 4: Calibration & Scorecard Rollup ---
  async getScorecardRollup(projectId: string): Promise<any> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/calibration/project/${projectId}/rollup`);
      if (!res.ok) return null;
      return await unpackJson(res);
    } catch {
      return null;
    }
  },

  async recalculateScorecard(projectId: string): Promise<any> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/calibration/project/${projectId}/calculate`, {
        method: 'POST',
      });
      if (!res.ok) return null;
      return await unpackJson(res);
    } catch {
      return null;
    }
  },

  async applyCalibration(projectId: string, overrides: Record<string, any>, notes: string): Promise<any> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/calibration/project/${projectId}/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ overrides, notes }),
      });
      if (!res.ok) return null;
      return await unpackJson(res);
    } catch {
      return null;
    }
  },

  async publishScorecard(
    projectId: string,
    report: { reportUrl: string; reportPublicId?: string; reportFileName?: string },
  ): Promise<any> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/calibration/project/${projectId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || 'Failed to publish scorecard');
      }
      return await unpackJson(res);
    } catch (e) {
      throw e;
    }
  },

  async replaceProjectReport(
    projectId: string,
    report: { reportUrl: string; reportPublicId?: string; reportFileName?: string },
  ): Promise<any> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/calibration/project/${projectId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || 'Failed to update certified report');
      }
      return await unpackJson(res);
    } catch (e) {
      throw e;
    }
  },
};
