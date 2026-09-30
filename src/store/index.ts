import { create } from 'zustand';
import { Project, AppSettings, TemplateSection, TemplateCategory, TemplateGroup, TemplateColumn, DataRecord, AnalyticsWidget } from '../lib/types';
import { apiClient } from '../lib/api';
import { toast } from '../components/ui/toast';

export interface User {
  id?: string;
  email: string;
  name: string;
  role: 'super_admin' | 'project_lead' | 'assessment_specialist' | 'client_viewer';
  department?: string;
  status?: 'active' | 'pending' | 'suspended';
  avatarBg?: string;
  lastActive?: string;
}

interface AppState {
  templates: TemplateSection[];
  projects: Project[];
  activeProject: Project | null;
  settings: AppSettings;
  widgets: AnalyticsWidget[];
  isLoading: boolean;
  isLoadingProjects: boolean;
  isLoadingTemplates: boolean;
  isLoadingWidgets: boolean;
  isLoadingSettings: boolean;
  projectsLoaded: boolean;
  templatesLoaded: boolean;
  widgetsLoaded: boolean;
  settingsLoaded: boolean;
  isSyncing: boolean;

  // Auth State & Actions
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: { name: string; email: string; password: string; department?: string }) => Promise<boolean>;
  logout: () => void;
  
  // Module-Wise On-Demand Fetchers
  fetchProjects: (force?: boolean) => Promise<void>;
  fetchTemplates: (force?: boolean) => Promise<void>;
  fetchWidgets: (force?: boolean) => Promise<void>;
  fetchSettings: (force?: boolean) => Promise<void>;

  // App Actions
  initialize: () => Promise<void>;
  updateSettings: (settings: AppSettings) => Promise<void>;
  loadSampleData: () => Promise<void>;

  // Widget Actions
  createWidget: (widget: Omit<AnalyticsWidget, 'id'>) => void;
  updateWidget: (id: string, updates: Partial<AnalyticsWidget>) => void;
  deleteWidget: (id: string) => void;
  toggleProjectWidget: (projectId: string, widgetId: string, enabled: boolean) => void;

  // Project Actions
  setActiveProject: (id: string | null) => void;
  createProject: (project: Omit<Project, 'id' | 'assignedSections' | 'data'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  updateDashboardLayout: (projectId: string, layout: any[]) => void;
  
  // Project Data Actions
  assignSectionToProject: (projectId: string, sectionId: string) => Promise<void>;
  updateProjectData: (projectId: string, nodeId: string, columnId: string, data: DataRecord) => Promise<void>;

  // Template Actions
  createTemplateSection: (section: Omit<TemplateSection, 'id' | 'categories'>) => void;
  updateTemplateSection: (id: string, updates: Partial<TemplateSection>) => void;
  deleteTemplateSection: (id: string) => void;
  
  createTemplateCategory: (sectionId: string, category: Omit<TemplateCategory, 'id' | 'groups' | 'columns'>) => void;
  updateTemplateCategory: (sectionId: string, categoryId: string, updates: Partial<TemplateCategory>) => void;
  deleteTemplateCategory: (sectionId: string, categoryId: string) => void;
  
  createTemplateGroup: (sectionId: string, categoryId: string, group: Omit<TemplateGroup, 'id' | 'columns'>) => void;
  updateTemplateGroup: (sectionId: string, categoryId: string, groupId: string, updates: Partial<TemplateGroup>) => void;
  deleteTemplateGroup: (sectionId: string, categoryId: string, groupId: string) => void;
  
  createTemplateColumn: (sectionId: string, categoryId: string, groupId: string | null, column: Omit<TemplateColumn, 'id'>) => void;
  updateTemplateColumn: (sectionId: string, categoryId: string, groupId: string | null, columnId: string, updates: Partial<TemplateColumn>) => void;
  deleteTemplateColumn: (sectionId: string, categoryId: string, groupId: string | null, columnId: string) => void;
}

// Helper to sync all template changes to projects that have them assigned
const syncProjectsWithTemplates = (templates: TemplateSection[] = [], projects: Project[] = []) => {
  let updated = false;
  const safeProjects = projects || [];
  const safeTemplates = templates || [];
  const newProjects = safeProjects.map(p => {
    let projectUpdated = false;
    const assigned = p.assignedSections || [];
    const newAssigned = assigned.map(pSec => {
      const template = safeTemplates.find(t => t.id === pSec.id);
      if (template) {
        projectUpdated = true;
        return JSON.parse(JSON.stringify(template));
      }
      return pSec;
    });
    if (projectUpdated) updated = true;
    return projectUpdated ? { ...p, assignedSections: newAssigned } : p;
  });
  return { newProjects, updated };
};

const defaultSettings: AppSettings = {
  companyProfile: {
    name: 'Rose Associates',
    address: '123 Planning Way',
    phone: '555-0100',
  },
  ratingBands: [
    { label: 'Poor', min: 0, max: 20, color: '#B5101A' },
    { label: 'Average', min: 21, max: 70, color: '#E08A15' },
    { label: 'Good', min: 71, max: 90, color: '#4B8B3B' },
    { label: 'Excellent', min: 91, max: 100, color: '#1F6F4A' }
  ]
};

let initializePromise: Promise<void> | null = null;

export const useAppStore = create<AppState>((set, get) => {
  // Read stored auth session if available on client
  let initialAuth = false;
  let initialUser: User | null = null;
  if (typeof window !== 'undefined') {
    const savedUser = localStorage.getItem('rose_auth_user');
    if (savedUser) {
      try {
        initialUser = JSON.parse(savedUser);
        initialAuth = true;
      } catch {
        localStorage.removeItem('rose_auth_user');
      }
    }
  }

  return {
    templates: [],
    projects: [],
    activeProject: null,
    settings: defaultSettings,
    widgets: [],
    isLoading: false,
    isLoadingProjects: false,
    isLoadingTemplates: false,
    isLoadingWidgets: false,
    isLoadingSettings: false,
    projectsLoaded: false,
    templatesLoaded: false,
    widgetsLoaded: false,
    settingsLoaded: false,
    isSyncing: false,

    // Auth State & Actions
    isAuthenticated: initialAuth,
    currentUser: initialUser,

    login: async (email: string, password: string) => {
      const res = await apiClient.login(email, password);
      if (res.success && res.user) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('rose_auth_user', JSON.stringify(res.user));
        }
        set({ isAuthenticated: true, currentUser: res.user as User });
        toast.success(`Welcome back, ${res.user.name}!`);
        return true;
      } else {
        toast.error(res.message || 'Invalid email or password.');
        return false;
      }
    },

    register: async (data: { name: string; email: string; password: string; department?: string }) => {
      const res = await apiClient.register(data);
      if (res.success && res.user) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('rose_auth_user', JSON.stringify(res.user));
        }
        set({ isAuthenticated: true, currentUser: res.user as User });
        toast.success(res.message || 'Registration successful! Welcome to Rose Associates.');
        return true;
      } else {
        toast.error(res.message || 'Registration failed.');
        return false;
      }
    },

    logout: async () => {
      await apiClient.logout();
      set({ isAuthenticated: false, currentUser: null });
      toast.info('Logged out successfully.');
    },

    // Module-Wise On-Demand Data Loaders
    fetchProjects: async (force = false) => {
      if (get().projectsLoaded && !force) return;
      set({ isLoadingProjects: true });
      try {
        const apiProjects = await apiClient.getProjects();
        if (apiProjects) {
          set({ projects: apiProjects, projectsLoaded: true });
          if (apiProjects.length > 0 && !get().activeProject) {
            set({ activeProject: apiProjects[0] });
          }
        }
      } catch (err) {
        console.error('Failed to fetch projects:', err);
      } finally {
        set({ isLoadingProjects: false, isLoading: false });
      }
    },

    fetchTemplates: async (force = false) => {
      if (get().templatesLoaded && !force) return;
      set({ isLoadingTemplates: true });
      try {
        const apiTemplates = await apiClient.getTemplates();
        if (apiTemplates) {
          apiTemplates.forEach(t => {
            t.categories?.forEach(c => {
              c.columns?.forEach(col => {
                if (col.name === 'Client Total Score' || col.name === 'Highest Score') {
                  if (col.isReadOnly) col.isReadOnly = false;
                }
                col.conditionalRules?.forEach(rule => {
                  if (rule.ifColumnId === col.id) rule.ifColumnId = '';
                });
              });
            });
          });
          set({ templates: apiTemplates, templatesLoaded: true });
        }
      } catch (err) {
        console.error('Failed to fetch templates:', err);
      } finally {
        set({ isLoadingTemplates: false });
      }
    },

    fetchWidgets: async (force = false) => {
      if (get().widgetsLoaded && !force) return;
      set({ isLoadingWidgets: true });
      try {
        const apiWidgets = await apiClient.getWidgets();
        if (apiWidgets) {
          set({ widgets: apiWidgets, widgetsLoaded: true });
        }
      } catch (err) {
        console.error('Failed to fetch widgets:', err);
      } finally {
        set({ isLoadingWidgets: false });
      }
    },

    fetchSettings: async (force = false) => {
      if (get().settingsLoaded && !force) return;
      set({ isLoadingSettings: true });
      try {
        const apiSettings = await apiClient.getSettings();
        if (apiSettings) {
          set({
            settings: {
              ...defaultSettings,
              ...apiSettings,
              companyProfile: apiSettings.companyProfile || defaultSettings.companyProfile,
              ratingBands: apiSettings.ratingBands || defaultSettings.ratingBands,
            },
            settingsLoaded: true,
          });
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      } finally {
        set({ isLoadingSettings: false });
      }
    },

    initialize: async () => {
      // Prevent duplicate concurrent initialization requests
      if (initializePromise) {
        return initializePromise;
      }

      initializePromise = (async () => {
        try {
          const userProfile = await apiClient.getMe();
          if (userProfile) {
            set({ currentUser: userProfile as User, isAuthenticated: true });
            if (typeof window !== 'undefined') {
              localStorage.setItem('rose_auth_user', JSON.stringify(userProfile));
            }
          }
        } catch {
          // Keep current stored auth state
        } finally {
          initializePromise = null;
        }
      })();

      return initializePromise;
    },

  loadSampleData: async () => {
    set({ isLoading: true });
    toast.loading("Loading sample data...");
    
    const apiSuccess = await apiClient.loadSampleData();
    if (apiSuccess) {
      toast.success("Sample data loaded from NestJS Backend server!");
    } else {
      toast.error("Failed to load sample data from server.");
    }
    
    await get().initialize();
  },

  updateSettings: async (settings) => {
    set({ settings });
    toast.success("Settings saved successfully!");
    apiClient.updateSettings(settings);
  },

  createWidget: (widgetData) => {
    const newWidget: AnalyticsWidget = {
      ...widgetData,
      id: `w_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };
    const widgets = [...get().widgets, newWidget];
    set({ widgets });
  },

  updateWidget: (id, updates) => {
    const widgets = get().widgets.map(w => w.id === id ? { ...w, ...updates } : w);
    set({ widgets });
  },

  deleteWidget: (id) => {
    const widgets = get().widgets.filter(w => w.id !== id);
    set({ widgets });
  },

  toggleProjectWidget: (projectId, widgetId, enabled) => {
    const projects = get().projects;
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    if (!project.enabledWidgets || project.enabledWidgets.length === 0) {
      const assignedSectionIds = (project.assignedSections || []).map(s => s.id);
      const allWidgets = get().widgets;
      project.enabledWidgets = allWidgets
        .filter(w => !w.sectionId || assignedSectionIds.includes(w.sectionId))
        .map(w => w.id);
    }

    if (enabled) {
      if (!project.enabledWidgets.includes(widgetId)) {
        project.enabledWidgets.push(widgetId);
      }
    } else {
      project.enabledWidgets = project.enabledWidgets.filter(w => w !== widgetId);
    }
    
    set({ projects: [...projects] });
    if (get().activeProject?.id === projectId) {
      set({ activeProject: { ...project } });
    }
    apiClient.updateProject(projectId, { enabledWidgets: project.enabledWidgets });
  },

  setActiveProject: (id) => {
    if (!id) {
      set({ activeProject: null });
      return;
    }
    const project = get().projects.find(p => p.id === id);
    if (project) {
      set({ activeProject: project });
    }
  },

  createProject: async (projectData) => {
    set({ isSyncing: true });
    const apiProject = await apiClient.createProject(projectData);
    if (apiProject) {
      const updatedProjects = [apiProject, ...get().projects];
      set({ projects: updatedProjects, activeProject: apiProject, isSyncing: false });
      toast.success(`Project "${apiProject.name}" created!`);
    } else {
      set({ isSyncing: false });
      toast.error("Failed to create project on server.");
    }
  },

  updateProject: async (id, updates) => {
    const projects = get().projects;
    const project = projects.find(p => p.id === id);
    if (project) {
      Object.assign(project, updates);
      set({ projects: [...projects] });
      if (get().activeProject?.id === id) {
        set({ activeProject: { ...project } });
      }
      toast.success("Project updated!");
      apiClient.updateProject(id, updates);
    }
  },

  updateDashboardLayout: (projectId, layout) => {
    const projects = get().projects;
    const project = projects.find(p => p.id === projectId);
    if (project) {
      project.dashboardLayout = layout;
      set({ projects: [...projects] });
      if (get().activeProject?.id === projectId) {
        set({ activeProject: { ...project } });
      }
      apiClient.updateProject(projectId, { dashboardLayout: layout });
    }
  },

  deleteProject: async (id) => {
    const project = get().projects.find(p => p.id === id);
    const projectName = project?.name || 'Project';
    
    const success = await apiClient.deleteProject(id);
    if (success) {
      const projects = get().projects.filter(p => p.id !== id);
      set({ projects });
      if (get().activeProject?.id === id) {
        set({ activeProject: projects.length > 0 ? projects[0] : null });
      }
      toast.success(`${projectName} deleted!`);
    } else {
      toast.error("Failed to delete project on server.");
    }
  },

  assignSectionToProject: async (projectId, sectionId) => {
    const template = get().templates.find(t => t.id === sectionId);
    if (!template) return;
    
    const projects = get().projects;
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    // Clone the template deeply
    const clonedSection = JSON.parse(JSON.stringify(template)) as TemplateSection;
    project.assignedSections.push(clonedSection);
    
    set({ projects: [...projects] });
    if (get().activeProject?.id === projectId) {
      set({ activeProject: { ...project } });
    }
    toast.success(`Assigned "${template.label}" section!`);
    apiClient.assignSection(projectId, sectionId);
  },

  updateProjectData: async (projectId, nodeId, columnId, data) => {
    const projects = get().projects;
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    if (!project.data[nodeId]) {
      project.data[nodeId] = {};
    }
    project.data[nodeId][columnId] = data;

    set({ projects: [...projects] });
    if (get().activeProject?.id === projectId) {
      set({ activeProject: { ...project } });
    }
    
    // Background sync to API
    apiClient.updateProjectData(projectId, nodeId, columnId, data);
  },

  // --- Templates ---

  createTemplateSection: (sectionData) => {
    const templates = get().templates;
    const newSection: TemplateSection = {
      ...sectionData,
      id: `ts_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      categories: [],
    };
    templates.push(newSection);
    set({ templates: [...templates] });
    toast.success(`Section "${newSection.label}" created!`);
    apiClient.createSection(sectionData);
  },

  updateTemplateSection: (id, updates) => {
    const templates = get().templates;
    const section = templates.find(s => s.id === id);
    if (section) {
      Object.assign(section, updates);
      
      const projects = get().projects;
      const { newProjects, updated } = syncProjectsWithTemplates(templates, projects);
      set({ templates: [...templates], projects: updated ? newProjects : projects });
      toast.success("Section updated!");
    }
  },

  deleteTemplateSection: (id) => {
    const section = get().templates.find(s => s.id === id);
    const label = section?.label || 'Section';
    const templates = get().templates.filter(s => s.id !== id);
    set({ templates });
    toast.success(`Section "${label}" deleted!`);
  },

  createTemplateCategory: (sectionId, categoryData) => {
    const templates = get().templates;
    const section = templates.find(s => s.id === sectionId);
    if (!section) return;
    const newCategory: TemplateCategory = {
      ...categoryData,
      id: `tc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      columns: [],
      groups: [],
    };
    section.categories.push(newCategory);
    
    const projects = get().projects;
    const { newProjects, updated } = syncProjectsWithTemplates(templates, projects);
    
    set({ templates: [...templates], projects: updated ? newProjects : projects });
    toast.success(`Category "${newCategory.label}" created!`);
  },

  updateTemplateCategory: (sectionId, categoryId, updates) => {
    const templates = get().templates;
    const section = templates.find(s => s.id === sectionId);
    if (!section) return;
    const category = section.categories.find(c => c.id === categoryId);
    if (!category) return;
    Object.assign(category, updates);
    
    const projects = get().projects;
    const { newProjects, updated } = syncProjectsWithTemplates(templates, projects);
    
    set({ templates: [...templates], projects: updated ? newProjects : projects });
    toast.success("Category updated!");
  },

  deleteTemplateCategory: (sectionId, categoryId) => {
    const templates = get().templates;
    const section = templates.find(s => s.id === sectionId);
    if (!section) return;
    section.categories = section.categories.filter(c => c.id !== categoryId);
    
    const projects = get().projects;
    const { newProjects, updated } = syncProjectsWithTemplates(templates, projects);
    
    set({ templates: [...templates], projects: updated ? newProjects : projects });
    toast.success("Category deleted!");
  },

  createTemplateGroup: (sectionId, categoryId, groupData) => {
    const templates = get().templates;
    const section = templates.find(s => s.id === sectionId);
    const category = section?.categories.find(c => c.id === categoryId);
    if (!category) return;
    const newGroup: TemplateGroup = {
      ...groupData,
      id: `tg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      columns: [],
    };
    category.groups.push(newGroup);
    
    const projects = get().projects;
    const { newProjects, updated } = syncProjectsWithTemplates(templates, projects);
    
    set({ templates: [...templates], projects: updated ? newProjects : projects });
    toast.success(`Subcategory "${newGroup.label}" created!`);
  },

  updateTemplateGroup: (sectionId, categoryId, groupId, updates) => {
    const templates = get().templates;
    const section = templates.find(s => s.id === sectionId);
    const category = section?.categories.find(c => c.id === categoryId);
    const group = category?.groups.find(g => g.id === groupId);
    if (!group) return;
    Object.assign(group, updates);
    
    const projects = get().projects;
    const { newProjects, updated } = syncProjectsWithTemplates(templates, projects);
    
    set({ templates: [...templates], projects: updated ? newProjects : projects });
    toast.success("Subcategory updated!");
  },

  deleteTemplateGroup: (sectionId, categoryId, groupId) => {
    const templates = get().templates;
    const section = templates.find(s => s.id === sectionId);
    const category = section?.categories.find(c => c.id === categoryId);
    if (!category) return;
    category.groups = category.groups.filter(g => g.id !== groupId);
    
    const projects = get().projects;
    const { newProjects, updated } = syncProjectsWithTemplates(templates, projects);
    
    set({ templates: [...templates], projects: updated ? newProjects : projects });
    toast.success("Subcategory deleted!");
  },

  createTemplateColumn: (sectionId, categoryId, groupId, columnData) => {
    const templates = get().templates;
    const section = templates.find(s => s.id === sectionId);
    const category = section?.categories.find(c => c.id === categoryId);
    if (!category) return;

    const newColumn: TemplateColumn = {
      ...columnData,
      id: `col_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };

    if (groupId) {
      const group = category.groups.find(g => g.id === groupId);
      if (group) group.columns.push(newColumn);
    } else {
      category.columns.push(newColumn);
    }
    
    const projects = get().projects;
    const { newProjects, updated } = syncProjectsWithTemplates(templates, projects);
    
    set({ templates: [...templates], projects: updated ? newProjects : projects });
    toast.success(`Column "${newColumn.name}" created!`);
  },

  updateTemplateColumn: (sectionId, categoryId, groupId, columnId, updates) => {
    const templates = get().templates;
    const section = templates.find(s => s.id === sectionId);
    const category = section?.categories.find(c => c.id === categoryId);
    if (!category) return;

    let column;
    if (groupId) {
      const group = category.groups.find(g => g.id === groupId);
      column = group?.columns.find(c => c.id === columnId);
    } else {
      column = category.columns.find(c => c.id === columnId);
    }
    if (!column) return;

    Object.assign(column, updates);
    
    const projects = get().projects;
    const { newProjects, updated } = syncProjectsWithTemplates(templates, projects);
    
    set({ templates, projects: updated ? newProjects : projects });
  },

  deleteTemplateColumn: (sectionId, categoryId, groupId, columnId) => {
    const templates = get().templates;
    const section = templates.find(s => s.id === sectionId);
    const category = section?.categories.find(c => c.id === categoryId);
    if (!category) return;

    if (groupId) {
      const group = category.groups.find(g => g.id === groupId);
      if (group) group.columns = group.columns.filter(c => c.id !== columnId);
    } else {
      category.columns = category.columns.filter(c => c.id !== columnId);
    }
    
    const projects = get().projects;
    const { newProjects, updated } = syncProjectsWithTemplates(templates, projects);
    
    set({ templates, projects: updated ? newProjects : projects });
  }
};
});
