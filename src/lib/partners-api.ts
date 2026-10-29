export interface LandingPartnerItem {
  id: string;
  name: string;
  logoUrl: string;
  sortOrder: number;
  status: 'draft' | 'published';
  createdAt?: string;
  updatedAt?: string;
}

export interface GetPartnersOptions {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  signal?: AbortSignal;
}

export interface PaginatedPartnersResponse {
  data: LandingPartnerItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_BASE = rawBase.replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '') + '/api/v1';

export function formatUserFriendlyErrorMessage(rawMessage: string): string {
  if (!rawMessage || typeof rawMessage !== 'string') {
    return 'An unexpected error occurred. Please try again.';
  }

  const lower = rawMessage.toLowerCase();
  if (lower.includes('econnrefused') || lower.includes('econnreset') || lower.includes('minio') || lower.includes('docker')) {
    return 'Unable to reach the file storage service. Please make sure the service is running and try again.';
  }
  if (lower.includes('access denied') || lower.includes('not authorized') || lower.includes('forbidden')) {
    return 'Permission denied. Unable to upload file. Please contact your system administrator.';
  }
  if (lower.includes('entitytoolarge') || lower.includes('too large') || lower.includes('413')) {
    return 'The file exceeds the maximum allowed upload size. Please choose a smaller file.';
  }

  return rawMessage;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `HTTP Error ${res.status}`;
    try {
      const data = await res.json();
      if (typeof data?.error?.message === 'string') {
        message = data.error.message;
      } else if (typeof data?.message === 'string') {
        message = data.message;
      } else if (typeof data?.error === 'string') {
        message = data.error;
      } else if (data && typeof data === 'object') {
        message = data.message || data.error?.message || JSON.stringify(data);
      }
    } catch {
      const text = await res.text();
      if (text) message = text;
    }
    throw new Error(formatUserFriendlyErrorMessage(message));
  }
  return res.json();
}

function unwrapPaginated(
  json: any,
  options: GetPartnersOptions,
): PaginatedPartnersResponse {
  if (json?.data && typeof json.data === 'object' && Array.isArray(json.data.data)) {
    const p = json.data;
    return {
      data: p.data,
      total: typeof p.total === 'number' ? p.total : p.data.length,
      page: typeof p.page === 'number' ? p.page : (options.page || 1),
      limit: typeof p.limit === 'number' ? p.limit : (options.limit || 12),
      totalPages: typeof p.totalPages === 'number' ? p.totalPages : (Math.ceil((p.total || p.data.length) / (options.limit || 12)) || 1),
    };
  }

  if (json && Array.isArray(json.data)) {
    return {
      data: json.data,
      total: typeof json.total === 'number' ? json.total : json.data.length,
      page: typeof json.page === 'number' ? json.page : (options.page || 1),
      limit: typeof json.limit === 'number' ? json.limit : (options.limit || 12),
      totalPages: typeof json.totalPages === 'number' ? json.totalPages : 1,
    };
  }

  if (Array.isArray(json)) {
    return {
      data: json,
      total: json.length,
      page: options.page || 1,
      limit: options.limit || 12,
      totalPages: Math.ceil(json.length / (options.limit || 12)) || 1,
    };
  }

  // Interceptor-wrapped raw array: { success, data: [...] }
  if (json?.data && Array.isArray(json.data)) {
    return {
      data: json.data,
      total: json.data.length,
      page: options.page || 1,
      limit: options.limit || 12,
      totalPages: 1,
    };
  }

  return { data: [], total: 0, page: 1, limit: 12, totalPages: 1 };
}

export const partnersApi = {
  async getPartners(options: GetPartnersOptions = {}): Promise<LandingPartnerItem[]> {
    try {
      const params = new URLSearchParams();
      if (options.status && options.status !== 'all') params.append('status', options.status);
      if (options.search && options.search.trim()) params.append('search', options.search.trim());

      const url = `${API_BASE}/landing-cms/partners?${params.toString()}`;
      const res = await fetch(url, { cache: 'no-store', signal: options.signal });
      if (!res.ok) return [];
      const json = await res.json();

      if (Array.isArray(json)) return json;
      if (Array.isArray(json?.data)) return json.data;
      if (Array.isArray(json?.data?.data)) return json.data.data;
      return [];
    } catch (err: any) {
      if (err?.name === 'AbortError') return [];
      console.warn('partnersApi.getPartners error:', err);
      return [];
    }
  },

  async getPaginatedPartners(options: GetPartnersOptions = {}): Promise<PaginatedPartnersResponse> {
    try {
      const params = new URLSearchParams();
      if (options.status && options.status !== 'all') params.append('status', options.status);
      if (options.search && options.search.trim()) params.append('search', options.search.trim());
      if (options.page) params.append('page', String(options.page));
      if (options.limit) params.append('limit', String(options.limit));

      const url = `${API_BASE}/landing-cms/partners?${params.toString()}`;
      const res = await fetch(url, { cache: 'no-store', signal: options.signal });
      if (!res.ok) {
        return { data: [], total: 0, page: options.page || 1, limit: options.limit || 12, totalPages: 1 };
      }
      const json = await res.json();
      return unwrapPaginated(json, options);
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return { data: [], total: 0, page: options.page || 1, limit: options.limit || 12, totalPages: 1 };
      }
      console.warn('partnersApi.getPaginatedPartners error:', err);
      return { data: [], total: 0, page: options.page || 1, limit: options.limit || 12, totalPages: 1 };
    }
  },

  async getPartnerById(id: string): Promise<LandingPartnerItem> {
    const url = `${API_BASE}/landing-cms/partners/${id}`;
    const res = await fetch(url, { cache: 'no-store' });
    const json = await handleResponse<any>(res);
    return json && json.data ? json.data : json;
  },

  async createPartner(data: Partial<LandingPartnerItem>): Promise<LandingPartnerItem> {
    const url = `${API_BASE}/landing-cms/partners`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await handleResponse<any>(res);
    return json && json.data ? json.data : json;
  },

  async updatePartner(id: string, data: Partial<LandingPartnerItem>): Promise<LandingPartnerItem> {
    const url = `${API_BASE}/landing-cms/partners/${id}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await handleResponse<any>(res);
    return json && json.data ? json.data : json;
  },

  async movePartner(id: string, direction: 'up' | 'down'): Promise<LandingPartnerItem> {
    const url = `${API_BASE}/landing-cms/partners/${id}/move`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ direction }),
    });
    const json = await handleResponse<any>(res);
    return json && json.data ? json.data : json;
  },

  async deletePartner(id: string): Promise<{ success: boolean }> {
    const url = `${API_BASE}/landing-cms/partners/${id}`;
    const res = await fetch(url, { method: 'DELETE' });
    return handleResponse<{ success: boolean }>(res);
  },

  async uploadLogo(file: File, folder: string = 'partners'): Promise<{ url: string; public_id: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${API_BASE}/uploads/image?folder=${encodeURIComponent(folder)}`;
    const res = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    const json = await handleResponse<any>(res);
    return json && json.data ? json.data : json;
  },
};
