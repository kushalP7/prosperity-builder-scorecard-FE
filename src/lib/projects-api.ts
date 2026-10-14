export interface LandingProjectItem {
  id: string;
  title: string;
  category: string;
  studyType: string;
  latitude: number;
  longitude: number;
  pdfUrl?: string;
  featured?: boolean;
  status: 'draft' | 'published';
  createdAt?: string;
  updatedAt?: string;
}

export interface CommunityFootprintLocation {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
}

export const PORTFOLIO_CATEGORIES = [
  'Corridor/Transportation Studies',
  'Master/Comprehensive Land Use',
  'Downtown & Small Area Plans',
  'Economic Development Strategic Plans',
  'Entitlements & Positioning',
] as const;

export const CATEGORY_COMMUNITIES: Record<string, string[]> = {
  'Corridor/Transportation Studies': [
    'Aiken, SC',
    'Asheville, NC (x3)',
    'Burlington, NC',
    'Columbia/Richland County, SC',
    'Concord, NC (x2)',
    'Davidson, NC',
    'Hwy 54 – Multicounty, NC',
    'Raleigh, NC (x2)',
    'Rolesville, NC',
    'Savannah, GA',
    'US 70 – Multicounty, NC',
    'Wilmington, NC',
  ],
  'Master/Comprehensive Land Use': [
    'Beaufort, SC',
    'Boone, NC',
    'Iredell County, NC',
    'Leland, NC',
    'Mebane, NC',
    'New Hanover County, NC',
    'Pender County, NC',
    'Rolesville, NC',
    'Stallings, NC',
    'Statesville, NC',
    'Trinity, NC',
    'Wendell, NC',
  ],
  'Downtown & Small Area Plans': [
    'Batesburg-Leesville, SC',
    'Boone, NC',
    'Charlotte, NC',
    'Clayton, NC',
    'Clemson, SC',
    'Cornelius, NC',
    'Davidson County, NC',
    'Dillon, SC',
    'Easley, SC',
    'Germantown, TN',
    'Gibsonville, NC',
    'Greenwood, SC',
    'Huntersville, NC',
    'Jacksonville, NC',
    'Lyman, SC',
    'Monroe, NC',
    'Mooresville, NC',
    'Pineville, NC',
    'Raleigh, NC',
    'Shelby, NC',
    'Spartanburg, SC',
    'Spencer, NC',
    'Wake Forest, NC',
    'Wingate, NC',
  ],
  'Economic Development Strategic Plans': [
    'Beaufort, SC',
    'Davidson, NC',
    'Fletcher, NC',
    'Germantown, TN',
    'Harnett County, NC',
    'Harrisburg, NC',
    'Rolesville, NC',
    'Sanford/Lee County, NC',
    'Summerfield, NC',
    'Wendell, NC',
    'Wingate, NC',
  ],
  'Entitlements & Positioning': [
    'Concord, NC',
    'Cornelius, NC',
    'Fletcher, NC',
    'Harrisburg, NC',
    'Huntersville, NC',
    'Marvin, NC',
    'Pineville, NC',
    'Wake Forest, NC',
  ],
};

// Geocoded past project locations where Rose Associates has worked (30-year track record)
export const COMMUNITY_FOOTPRINT_LOCATIONS: CommunityFootprintLocation[] = [
  // Corridor / Transportation Studies
  { id: 'footprint-cts-aiken', name: 'Aiken, SC', category: 'Corridor/Transportation Studies', latitude: 33.5604, longitude: -81.7196 },
  { id: 'footprint-cts-asheville', name: 'Asheville, NC', category: 'Corridor/Transportation Studies', latitude: 35.5951, longitude: -82.5515 },
  { id: 'footprint-cts-burlington', name: 'Burlington, NC', category: 'Corridor/Transportation Studies', latitude: 36.0957, longitude: -79.4378 },
  { id: 'footprint-cts-columbia', name: 'Columbia/Richland County, SC', category: 'Corridor/Transportation Studies', latitude: 34.0007, longitude: -81.0348 },
  { id: 'footprint-cts-concord', name: 'Concord, NC', category: 'Corridor/Transportation Studies', latitude: 35.4088, longitude: -80.5795 },
  { id: 'footprint-cts-davidson', name: 'Davidson, NC', category: 'Corridor/Transportation Studies', latitude: 35.4993, longitude: -80.8487 },
  { id: 'footprint-cts-hwy54', name: 'Hwy 54 – Multicounty, NC', category: 'Corridor/Transportation Studies', latitude: 35.9132, longitude: -79.0558 },
  { id: 'footprint-cts-raleigh', name: 'Raleigh, NC', category: 'Corridor/Transportation Studies', latitude: 35.7796, longitude: -78.6382 },
  { id: 'footprint-cts-rolesville', name: 'Rolesville, NC', category: 'Corridor/Transportation Studies', latitude: 35.9232, longitude: -78.4564 },
  { id: 'footprint-cts-savannah', name: 'Savannah, GA', category: 'Corridor/Transportation Studies', latitude: 32.0809, longitude: -81.0912 },
  { id: 'footprint-cts-us70', name: 'US 70 – Multicounty, NC', category: 'Corridor/Transportation Studies', latitude: 35.6321, longitude: -78.0000 },
  { id: 'footprint-cts-wilmington', name: 'Wilmington, NC', category: 'Corridor/Transportation Studies', latitude: 34.2257, longitude: -77.9447 },

  // Master / Comprehensive Land Use
  { id: 'footprint-clu-beaufort', name: 'Beaufort, SC', category: 'Master/Comprehensive Land Use', latitude: 32.4316, longitude: -80.6698 },
  { id: 'footprint-clu-boone', name: 'Boone, NC', category: 'Master/Comprehensive Land Use', latitude: 36.2168, longitude: -81.6746 },
  { id: 'footprint-clu-iredell', name: 'Iredell County, NC', category: 'Master/Comprehensive Land Use', latitude: 35.7874, longitude: -80.8887 },
  { id: 'footprint-clu-leland', name: 'Leland, NC', category: 'Master/Comprehensive Land Use', latitude: 34.2563, longitude: -78.0447 },
  { id: 'footprint-clu-mebane', name: 'Mebane, NC', category: 'Master/Comprehensive Land Use', latitude: 36.0960, longitude: -79.2667 },
  { id: 'footprint-clu-newhanover', name: 'New Hanover County, NC', category: 'Master/Comprehensive Land Use', latitude: 34.2694, longitude: -77.8931 },
  { id: 'footprint-clu-pender', name: 'Pender County, NC', category: 'Master/Comprehensive Land Use', latitude: 34.5204, longitude: -77.8883 },
  { id: 'footprint-clu-rolesville', name: 'Rolesville, NC', category: 'Master/Comprehensive Land Use', latitude: 35.9232, longitude: -78.4564 },
  { id: 'footprint-clu-stallings', name: 'Stallings, NC', category: 'Master/Comprehensive Land Use', latitude: 35.0863, longitude: -80.6865 },
  { id: 'footprint-clu-statesville', name: 'Statesville, NC', category: 'Master/Comprehensive Land Use', latitude: 35.7826, longitude: -80.8873 },
  { id: 'footprint-clu-trinity', name: 'Trinity, NC', category: 'Master/Comprehensive Land Use', latitude: 35.8885, longitude: -79.9961 },
  { id: 'footprint-clu-wendell', name: 'Wendell, NC', category: 'Master/Comprehensive Land Use', latitude: 35.7810, longitude: -78.3697 },

  // Downtown & Small Area Plans
  { id: 'footprint-dsa-batesburg', name: 'Batesburg-Leesville, SC', category: 'Downtown & Small Area Plans', latitude: 33.9082, longitude: -81.5434 },
  { id: 'footprint-dsa-boone', name: 'Boone, NC', category: 'Downtown & Small Area Plans', latitude: 36.2168, longitude: -81.6746 },
  { id: 'footprint-dsa-charlotte', name: 'Charlotte, NC', category: 'Downtown & Small Area Plans', latitude: 35.2271, longitude: -80.8431 },
  { id: 'footprint-dsa-clayton', name: 'Clayton, NC', category: 'Downtown & Small Area Plans', latitude: 35.6507, longitude: -78.4564 },
  { id: 'footprint-dsa-clemson', name: 'Clemson, SC', category: 'Downtown & Small Area Plans', latitude: 34.6834, longitude: -82.8374 },
  { id: 'footprint-dsa-cornelius', name: 'Cornelius, NC', category: 'Downtown & Small Area Plans', latitude: 35.4868, longitude: -80.8601 },
  { id: 'footprint-dsa-davidson-co', name: 'Davidson County, NC', category: 'Downtown & Small Area Plans', latitude: 35.7932, longitude: -80.2115 },
  { id: 'footprint-dsa-dillon', name: 'Dillon, SC', category: 'Downtown & Small Area Plans', latitude: 34.4165, longitude: -79.3712 },
  { id: 'footprint-dsa-easley', name: 'Easley, SC', category: 'Downtown & Small Area Plans', latitude: 34.8298, longitude: -82.5999 },
  { id: 'footprint-dsa-germantown', name: 'Germantown, TN', category: 'Downtown & Small Area Plans', latitude: 35.0868, longitude: -89.8101 },
  { id: 'footprint-dsa-gibsonville', name: 'Gibsonville, NC', category: 'Downtown & Small Area Plans', latitude: 36.1018, longitude: -79.5414 },
  { id: 'footprint-dsa-greenwood', name: 'Greenwood, SC', category: 'Downtown & Small Area Plans', latitude: 34.1954, longitude: -82.1618 },
  { id: 'footprint-dsa-huntersville', name: 'Huntersville, NC', category: 'Downtown & Small Area Plans', latitude: 35.4107, longitude: -80.8429 },
  { id: 'footprint-dsa-jacksonville', name: 'Jacksonville, NC', category: 'Downtown & Small Area Plans', latitude: 34.7541, longitude: -77.4302 },
  { id: 'footprint-dsa-lyman', name: 'Lyman, SC', category: 'Downtown & Small Area Plans', latitude: 34.9482, longitude: -82.1287 },
  { id: 'footprint-dsa-monroe', name: 'Monroe, NC', category: 'Downtown & Small Area Plans', latitude: 34.9854, longitude: -80.5495 },
  { id: 'footprint-dsa-mooresville', name: 'Mooresville, NC', category: 'Downtown & Small Area Plans', latitude: 35.5849, longitude: -80.8101 },
  { id: 'footprint-dsa-pineville', name: 'Pineville, NC', category: 'Downtown & Small Area Plans', latitude: 35.0832, longitude: -80.8926 },
  { id: 'footprint-dsa-raleigh', name: 'Raleigh, NC', category: 'Downtown & Small Area Plans', latitude: 35.7796, longitude: -78.6382 },
  { id: 'footprint-dsa-shelby', name: 'Shelby, NC', category: 'Downtown & Small Area Plans', latitude: 35.2924, longitude: -81.5357 },
  { id: 'footprint-dsa-spartanburg', name: 'Spartanburg, SC', category: 'Downtown & Small Area Plans', latitude: 34.9496, longitude: -81.9320 },
  { id: 'footprint-dsa-spencer', name: 'Spencer, NC', category: 'Downtown & Small Area Plans', latitude: 35.6946, longitude: -80.4345 },
  { id: 'footprint-dsa-wakeforest', name: 'Wake Forest, NC', category: 'Downtown & Small Area Plans', latitude: 35.9799, longitude: -78.5097 },
  { id: 'footprint-dsa-wingate', name: 'Wingate, NC', category: 'Downtown & Small Area Plans', latitude: 34.9854, longitude: -80.4492 },

  // Economic Development Strategic Plans
  { id: 'footprint-ed-beaufort', name: 'Beaufort, SC', category: 'Economic Development Strategic Plans', latitude: 32.4316, longitude: -80.6698 },
  { id: 'footprint-ed-davidson', name: 'Davidson, NC', category: 'Economic Development Strategic Plans', latitude: 35.4993, longitude: -80.8487 },
  { id: 'footprint-ed-fletcher', name: 'Fletcher, NC', category: 'Economic Development Strategic Plans', latitude: 35.4309, longitude: -82.5012 },
  { id: 'footprint-ed-germantown', name: 'Germantown, TN', category: 'Economic Development Strategic Plans', latitude: 35.0868, longitude: -89.8101 },
  { id: 'footprint-ed-harnett', name: 'Harnett County, NC', category: 'Economic Development Strategic Plans', latitude: 35.3700, longitude: -78.8687 },
  { id: 'footprint-ed-harrisburg', name: 'Harrisburg, NC', category: 'Economic Development Strategic Plans', latitude: 35.3232, longitude: -80.6558 },
  { id: 'footprint-ed-rolesville', name: 'Rolesville, NC', category: 'Economic Development Strategic Plans', latitude: 35.9232, longitude: -78.4564 },
  { id: 'footprint-ed-sanford', name: 'Sanford/Lee County, NC', category: 'Economic Development Strategic Plans', latitude: 35.4799, longitude: -79.1803 },
  { id: 'footprint-ed-summerfield', name: 'Summerfield, NC', category: 'Economic Development Strategic Plans', latitude: 36.2085, longitude: -79.9009 },
  { id: 'footprint-ed-wendell', name: 'Wendell, NC', category: 'Economic Development Strategic Plans', latitude: 35.7810, longitude: -78.3697 },
  { id: 'footprint-ed-wingate', name: 'Wingate, NC', category: 'Economic Development Strategic Plans', latitude: 34.9854, longitude: -80.4492 },

  // Entitlements & Positioning
  { id: 'footprint-ent-concord', name: 'Concord, NC', category: 'Entitlements & Positioning', latitude: 35.4088, longitude: -80.5795 },
  { id: 'footprint-ent-cornelius', name: 'Cornelius, NC', category: 'Entitlements & Positioning', latitude: 35.4868, longitude: -80.8601 },
  { id: 'footprint-ent-fletcher', name: 'Fletcher, NC', category: 'Entitlements & Positioning', latitude: 35.4309, longitude: -82.5012 },
  { id: 'footprint-ent-harrisburg', name: 'Harrisburg, NC', category: 'Entitlements & Positioning', latitude: 35.3232, longitude: -80.6558 },
  { id: 'footprint-ent-huntersville', name: 'Huntersville, NC', category: 'Entitlements & Positioning', latitude: 35.4107, longitude: -80.8429 },
  { id: 'footprint-ent-marvin', name: 'Marvin, NC', category: 'Entitlements & Positioning', latitude: 35.0254, longitude: -80.8228 },
  { id: 'footprint-ent-pineville', name: 'Pineville, NC', category: 'Entitlements & Positioning', latitude: 35.0832, longitude: -80.8926 },
  { id: 'footprint-ent-wakeforest', name: 'Wake Forest, NC', category: 'Entitlements & Positioning', latitude: 35.9799, longitude: -78.5097 },
];

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

export interface GetProjectsOptions {
  category?: string;
  status?: string;
  featured?: boolean;
  search?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
  signal?: AbortSignal;
}

export interface PaginatedProjectsResponse {
  data: LandingProjectItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const projectsApi = {
  // Get all landing projects with optional filters (unpaginated raw array)
  async getProjects(
    filters?: {
      category?: string;
      status?: string;
      featured?: boolean;
      search?: string;
    },
    signal?: AbortSignal
  ): Promise<LandingProjectItem[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.category && filters.category !== 'all') params.append('category', filters.category);
      if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters?.featured !== undefined) params.append('featured', String(filters.featured));
      if (filters?.search) params.append('search', filters.search);

      const url = `${API_BASE}/landing-cms/projects?${params.toString()}`;
      const res = await fetch(url, { cache: 'no-store', signal });
      if (!res.ok) return [];
      const json = await res.json();
      if (Array.isArray(json)) return json;
      if (json?.data && Array.isArray(json.data.data)) return json.data.data;
      if (json && Array.isArray(json.data)) return json.data;
      return [];
    } catch (err: any) {
      if (err?.name === 'AbortError') return [];
      console.warn('projectsApi.getProjects fetch error:', err);
      return [];
    }
  },

  // Get paginated projects from server with full query params
  async getPaginatedProjects(options: GetProjectsOptions = {}): Promise<PaginatedProjectsResponse> {
    try {
      const params = new URLSearchParams();
      if (options.category && options.category !== 'all') params.append('category', options.category);
      if (options.status && options.status !== 'all') params.append('status', options.status);
      if (options.featured !== undefined) params.append('featured', String(options.featured));
      if (options.search && options.search.trim()) params.append('search', options.search.trim());
      if (options.sortBy) params.append('sortBy', options.sortBy);
      if (options.page) params.append('page', String(options.page));
      if (options.limit) params.append('limit', String(options.limit));

      const url = `${API_BASE}/landing-cms/projects?${params.toString()}`;
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
      console.warn('projectsApi.getPaginatedProjects error:', err);
      return { data: [], total: 0, page: options.page || 1, limit: options.limit || 12, totalPages: 1 };
    }
  },

  // Get project by ID
  async getProjectById(id: string): Promise<LandingProjectItem> {
    const url = `${API_BASE}/landing-cms/projects/${id}`;
    const res = await fetch(url, { cache: 'no-store' });
    const json = await handleResponse<any>(res);
    return json && json.data ? json.data : json;
  },

  // Create new project
  async createProject(data: Partial<LandingProjectItem>): Promise<LandingProjectItem> {
    const url = `${API_BASE}/landing-cms/projects`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await handleResponse<any>(res);
    return json && json.data ? json.data : json;
  },

  // Update project
  async updateProject(id: string, data: Partial<LandingProjectItem>): Promise<LandingProjectItem> {
    const url = `${API_BASE}/landing-cms/projects/${id}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await handleResponse<any>(res);
    return json && json.data ? json.data : json;
  },

  // Delete project
  async deleteProject(id: string): Promise<{ success: boolean }> {
    const url = `${API_BASE}/landing-cms/projects/${id}`;
    const res = await fetch(url, { method: 'DELETE' });
    return handleResponse<{ success: boolean }>(res);
  },

  // Upload PDF document to Cloudinary
  async uploadPdf(file: File, folder: string = 'Rose/Projects/PDF'): Promise<{ url: string; public_id: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${API_BASE}/uploads/file?folder=${encodeURIComponent(folder)}`;
    const res = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    const json = await handleResponse<any>(res);
    return json && json.data ? json.data : json;
  },
};
