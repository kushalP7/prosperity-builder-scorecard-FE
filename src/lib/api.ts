import { Project, AppSettings, TemplateSection, AnalyticsWidget, DataRecord } from './types';

const rawBase = (import.meta as any).env?.VITE_API_URL || (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) || 'http://localhost:3001';
const API_BASE = rawBase.replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '') + '/api/v1';

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 60000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export const apiClient = {
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
