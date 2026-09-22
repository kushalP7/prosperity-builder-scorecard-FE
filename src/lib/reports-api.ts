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

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api\/v1\/?$/, '');

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `HTTP Error ${res.status}`);
  }
  return res.json();
}

export const reportsApi = {
  // Get all reports with optional filters (Guaranteed Array return)
  async getReports(status?: string, featured?: boolean, search?: string, signal?: AbortSignal): Promise<LandingReportItem[]> {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (featured) params.append('featured', 'true');
      if (search) params.append('search', search);

      const url = `${API_BASE}/landing-cms/reports?${params.toString()}`;
      const res = await fetch(url, { cache: 'no-store', signal });
      if (!res.ok) return [];
      const json = await res.json();
      if (Array.isArray(json)) return json;
      if (json && Array.isArray(json.data)) return json.data;
      return [];
    } catch (err: any) {
      if (err?.name === 'AbortError') return [];
      console.warn('reportsApi.getReports fetch error:', err);
      return [];
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
