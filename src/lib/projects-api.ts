export interface LandingProjectItem {
  id: string;
  title: string;
  category: string;
  studyType: string;
  latitude: number;
  longitude: number;
  pdfUrl: string;
  featured?: boolean;
  status: 'draft' | 'published';
  createdAt?: string;
  updatedAt?: string;
}

export const PORTFOLIO_CATEGORIES = [
  'Corridor/Transportation Studies',
  'Master/Comprehensive Land Use',
  'Downtown & Small Area Plans',
  'Economic Development Strategic Plans',
  'Entitlements & Positioning',
  'Asset/Portfolio Analysis & Strategy',
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
  'Asset/Portfolio Analysis & Strategy': [
    'Davidson, NC',
    'Huntersville, NC',
    'Winston-Salem, NC',
  ],
};

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api\/v1\/?$/, '');

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `HTTP Error ${res.status}`);
  }
  return res.json();
}

export const projectsApi = {
  // Get all landing projects with optional filters
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
      if (json && Array.isArray(json.data)) return json.data;
      return [];
    } catch (err: any) {
      if (err?.name === 'AbortError') return [];
      console.warn('projectsApi.getProjects fetch error:', err);
      return [];
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
