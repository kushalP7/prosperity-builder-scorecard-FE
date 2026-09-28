import { Project, AppSettings, TemplateSection, ProjectSchema, AppSettingsSchema, TemplateSectionSchema, AnalyticsWidget, AnalyticsWidgetSchema } from './types';

const PROJECTS_KEY = 'prosperity_projects';
const TEMPLATES_KEY = 'prosperity_templates';
const SETTINGS_KEY = 'prosperity_settings';
const WIDGETS_KEY = 'prosperity_widgets';

export class StorageQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageQuotaError';
  }
}

function safeGetItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key);
}

function safeSetItem(key: string, value: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch (e: any) {
    if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      throw new StorageQuotaError('Local storage quota exceeded. Please free up some space.');
    }
    throw e;
  }
}

export const storage = {
  getTemplates(): TemplateSection[] {
    const data = safeGetItem(TEMPLATES_KEY);
    if (!data) return [];
    try {
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((p: any) => {
        const result = TemplateSectionSchema.safeParse(p);
        return result.success ? result.data : null;
      }).filter(Boolean) as TemplateSection[];
    } catch {
      return [];
    }
  },

  saveTemplates(templates: TemplateSection[]) {
    safeSetItem(TEMPLATES_KEY, JSON.stringify(templates));
  },

  getWidgets(): AnalyticsWidget[] {
    const data = safeGetItem(WIDGETS_KEY);
    if (!data) return [];
    try {
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((w: any) => {
        const result = AnalyticsWidgetSchema.safeParse(w);
        return result.success ? result.data : null;
      }).filter(Boolean) as AnalyticsWidget[];
    } catch {
      return [];
    }
  },

  saveWidgets(widgets: AnalyticsWidget[]) {
    safeSetItem(WIDGETS_KEY, JSON.stringify(widgets));
  },

  getProjects(): Project[] {
    const data = safeGetItem(PROJECTS_KEY);
    if (!data) return [];
    try {
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((p: any) => {
        const result = ProjectSchema.safeParse(p);
        return result.success ? result.data : null;
      }).filter(Boolean) as Project[];
    } catch {
      return [];
    }
  },

  getProject(id: string): Project | null {
    const projects = this.getProjects();
    return projects.find((p) => p.id === id) || null;
  },

  saveProject(project: Project) {
    const projects = this.getProjects();
    const index = projects.findIndex((p) => p.id === project.id);
    if (index >= 0) {
      projects[index] = project;
    } else {
      projects.push(project);
    }
    safeSetItem(PROJECTS_KEY, JSON.stringify(projects));
  },

  saveProjects(projects: Project[]) {
    safeSetItem(PROJECTS_KEY, JSON.stringify(projects));
  },

  deleteProject(id: string) {
    const newProjects = this.getProjects().filter((p) => p.id !== id);
    safeSetItem(PROJECTS_KEY, JSON.stringify(newProjects));
  },

  getSettings(): AppSettings {
    const defaultSettings: AppSettings = {
      companyProfile: {
        name: 'Rose Associates',
        address: '123 Planning Way',
        phone: '555-0100',
      },
      ratingBands: [
        { min: 0, max: 20, label: 'Poor', color: '#B5101A' },
        { min: 21, max: 70, label: 'Average', color: '#E08A15' },
        { min: 71, max: 90, label: 'Good', color: '#4B8B3B' },
        { min: 91, max: 100, label: 'Excellent', color: '#1F6F4A' }
      ]
    };

    const data = safeGetItem(SETTINGS_KEY);
    if (!data) return defaultSettings;
    try {
      const parsed = JSON.parse(data);
      const result = AppSettingsSchema.safeParse(parsed);
      return result.success ? result.data : defaultSettings;
    } catch {
      return defaultSettings;
    }
  },

  saveSettings(settings: AppSettings) {
    safeSetItem(SETTINGS_KEY, JSON.stringify(settings));
  }
};
