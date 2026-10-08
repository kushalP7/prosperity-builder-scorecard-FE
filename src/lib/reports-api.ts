export type ImageTextLayout = 'wrap' | 'columns' | 'stacked';

export interface ImageTextItem {
  id: string;
  title?: string;
  imageUrl?: string;
  contentHtml?: string;
  imagePosition?: 'left' | 'right';
  layoutStyle?: ImageTextLayout;
}

export interface ReportSectionBlock {
  id: string;
  type: 'hero' | 'rich_text' | 'pdf_viewer' | 'stats_grid' | 'gallery' | 'downloads' | 'image_text';
  title?: string;
  subtitle?: string;
  contentHtml?: string;
  bottomContentHtml?: string;
  pdfUrl?: string;
  imageUrl?: string;
  imagePosition?: 'left' | 'right';
  layoutStyle?: ImageTextLayout;
  items?: ImageTextItem[];
  stats?: { label: string; value: string; subtext?: string }[];
  images?: { url: string; caption?: string }[];
  files?: { name: string; url: string; size?: string }[];
}

export interface LandingReportItem {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  author?: string;
  publishedAt?: string;
  coverImage?: string;
  pdfUrl?: string;
  summary?: string;
  contentHtml?: string;
  featured?: boolean;
  status: 'draft' | 'published';
  blocks?: ReportSectionBlock[];
  createdAt?: string;
  updatedAt?: string;
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

export interface GetReportsOptions {
  status?: string;
  featured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  year?: string;
  signal?: AbortSignal;
}

export interface PaginatedReportsResponse {
  data: LandingReportItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const reportsApi = {
  // Get all reports with optional filters (Guaranteed Array return)
  async getReports(status?: string, featured?: boolean, search?: string, signal?: AbortSignal): Promise<LandingReportItem[]> {
    try {
      const params = new URLSearchParams();
      if (status && status !== 'all') params.append('status', status);
      if (featured) params.append('featured', 'true');
      if (search) params.append('search', search);

      const url = `${API_BASE}/landing-cms/reports?${params.toString()}`;
      const res = await fetch(url, { cache: 'no-store', signal });
      if (!res.ok) return [];
      const json = await res.json();
      if (Array.isArray(json)) return json;
      if (json?.data && Array.isArray(json.data.data)) return json.data.data;
      if (json && Array.isArray(json.data)) return json.data;
      return [];
    } catch (err: any) {
      if (err?.name === 'AbortError') return [];
      console.warn('reportsApi.getReports fetch error:', err);
      return [];
    }
  },

  // Get paginated reports from server with full query params
  async getPaginatedReports(options: GetReportsOptions = {}): Promise<PaginatedReportsResponse> {
    try {
      const params = new URLSearchParams();
      if (options.status && options.status !== 'all') params.append('status', options.status);
      if (options.featured) params.append('featured', 'true');
      if (options.search && options.search.trim()) params.append('search', options.search.trim());
      if (options.page) params.append('page', String(options.page));
      if (options.limit) params.append('limit', String(options.limit));
      if (options.sortBy) params.append('sortBy', options.sortBy);
      if (options.year && options.year !== 'all') params.append('year', options.year);

      const url = `${API_BASE}/landing-cms/reports?${params.toString()}`;
      const res = await fetch(url, { cache: 'no-store', signal: options.signal });
      if (!res.ok) {
        return { data: [], total: 0, page: options.page || 1, limit: options.limit || 12, totalPages: 1 };
      }
      const json = await res.json();

      // Case 1: NestJS TransformInterceptor wrapping: { success: true, data: { data: [...], total, page, limit, totalPages } }
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

      // Case 2: Standard paginated response: { data: [...], total, page, limit, totalPages }
      if (json && Array.isArray(json.data)) {
        return {
          data: json.data,
          total: typeof json.total === 'number' ? json.total : json.data.length,
          page: typeof json.page === 'number' ? json.page : (options.page || 1),
          limit: typeof json.limit === 'number' ? json.limit : (options.limit || 12),
          totalPages: typeof json.totalPages === 'number' ? json.totalPages : 1,
        };
      }

      // Case 3: Raw array response: [...]
      if (Array.isArray(json)) {
        return {
          data: json,
          total: json.length,
          page: options.page || 1,
          limit: options.limit || 12,
          totalPages: Math.ceil(json.length / (options.limit || 12)) || 1,
        };
      }
      return { data: [], total: 0, page: 1, limit: 12, totalPages: 1 };
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return { data: [], total: 0, page: options.page || 1, limit: options.limit || 12, totalPages: 1 };
      }
      console.warn('reportsApi.getPaginatedReports error:', err);
      return { data: [], total: 0, page: options.page || 1, limit: options.limit || 12, totalPages: 1 };
    }
  },

  // Get single report by slug (unwraps .data if present)
  async getReportBySlug(slug: string): Promise<LandingReportItem> {
    const url = `${API_BASE}/landing-cms/reports/slug/${encodeURIComponent(slug)}`;
    const res = await fetch(url, { cache: 'no-store' });
    const json = await handleResponse<any>(res);
    return (json && json.data) ? json.data : json;
  },

  // Get single report by ID (unwraps .data if present)
  async getReportById(id: string): Promise<LandingReportItem> {
    const url = `${API_BASE}/landing-cms/reports/${id}`;
    const res = await fetch(url, { cache: 'no-store' });
    const json = await handleResponse<any>(res);
    return (json && json.data) ? json.data : json;
  },

  // Create new report
  async createReport(reportData: Partial<LandingReportItem>): Promise<LandingReportItem> {
    const url = `${API_BASE}/landing-cms/reports`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData),
    });
    const json = await handleResponse<any>(res);
    return (json && json.data) ? json.data : json;
  },

  // Update existing report
  async updateReport(id: string, updates: Partial<LandingReportItem>): Promise<LandingReportItem> {
    const url = `${API_BASE}/landing-cms/reports/${id}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const json = await handleResponse<any>(res);
    return (json && json.data) ? json.data : json;
  },

  // Delete report
  async deleteReport(id: string): Promise<{ success: boolean; id: string }> {
    const url = `${API_BASE}/landing-cms/reports/${id}`;
    const res = await fetch(url, { method: 'DELETE' });
    return handleResponse<{ success: boolean; id: string }>(res);
  },

  // Upload image file to Cloudinary with target folder (reports, media, projects)
  async uploadImage(file: File, folder: string = 'reports'): Promise<{ url: string; public_id: string; format: string; bytes: number }> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${API_BASE}/uploads/image?folder=${encodeURIComponent(folder)}`;
    const res = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    const json = await handleResponse<any>(res);
    return (json && json.data) ? json.data : json;
  },

  // Upload document or PDF file to Cloudinary with target folder (reports, media, projects)
  async uploadDocument(file: File, folder: string = 'reports'): Promise<{ url: string; public_id: string; format: string; bytes: number }> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${API_BASE}/uploads/file?folder=${encodeURIComponent(folder)}`;
    const res = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    const json = await handleResponse<any>(res);
    return (json && json.data) ? json.data : json;
  },

  // Delete file from Cloudinary by url or publicId
  async deleteUpload(params: { url?: string; publicId?: string; resourceType?: string }): Promise<{ success: boolean; result?: string }> {
    const res = await fetch(`${API_BASE}/uploads`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const json = await handleResponse<any>(res);
    return (json && json.data) ? json.data : json;
  },
};
