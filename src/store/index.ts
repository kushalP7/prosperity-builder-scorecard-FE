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
  updateProject: (id: string, updates: Partial<Project>) => Promise<boolean>;
  deleteProject: (id: string) => Promise<void>;
  restoreProject: (id: string) => Promise<void>;
  updateDashboardLayout: (projectId: string, layout: any[]) => void;

  // Project Data Actions
  assignSectionToProject: (projectId: string, sectionId: string) => Promise<void>;
  assignSectionsToProject: (projectId: string, sectionIds: string[]) => Promise<void>;
  updateProjectData: (projectId: string, nodeId: string, columnId: string, data: DataRecord) => Promise<void>;

  // Template Actions
  createTemplateSection: (section: Omit<TemplateSection, 'id' | 'categories'>) => void;
  updateTemplateSection: (id: string, updates: Partial<TemplateSection>) => void;
  deleteTemplateSection: (id: string) => void;
  publishNewSectionVersion: (sectionId: string, changelog?: string) => Promise<TemplateSection | null>;

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
  ],
  planPrices: {
    reportPrice: 15000,
    subscriptionPrice: 36000,
    combinedPrice: 48000,
  },
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

    fetchProjects: async (force = false) => {
      if (get().projectsLoaded && !force) return;
      set({ isLoadingProjects: true });
      try {
        const apiProjects = await apiClient.getProjects();
        if (apiProjects) {
          const currentProjects = get().projects;
          const list = Array.isArray(apiProjects) ? apiProjects : (apiProjects.data || []);
          const merged = list.map((apiP: any) => {
            const current = currentProjects.find(c => c.id === apiP.id);
            if (current && current.assignedSections?.some(s => Array.isArray(s.categories) && s.categories.length > 0)) {
              return {
                ...apiP,
                assignedSections: current.assignedSections,
                data: current.data && Object.keys(current.data).length > 0 ? current.data : apiP.data,
              };
            }
            return apiP;
          });
          set({ projects: merged, projectsLoaded: true });
          if (merged.length > 0 && !get().activeProject) {
            set({ activeProject: merged[0] });
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
              planPrices: apiSettings.planPrices || defaultSettings.planPrices,
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
      set({ isSyncing: true });
      try {
        const success = await apiClient.updateProject(id, updates);
        if (success) {
          const projects = get().projects;
          const updatedProjects = projects.map(p => p.id === id ? { ...p, ...updates } : p);
          set({ projects: updatedProjects });

          if (get().activeProject?.id === id) {
            set({ activeProject: { ...get().activeProject, ...updates } as any });
          }
          toast.success("Project updated successfully!");
          return true;
        } else {
          toast.error("Failed to update project on server.");
          return false;
        }
      } catch (err) {
        console.error("Error updating project:", err);
        toast.error("Failed to update project.");
        return false;
      } finally {
        set({ isSyncing: false });
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
        toast.success(`"${projectName}" moved to trash.`);
      } else {
        toast.error("Failed to delete project on server.");
      }
    },

    restoreProject: async (id) => {
      const success = await apiClient.restoreProject(id);
      if (success) {
        await get().fetchProjects(true);
        toast.success("Project restored successfully!");
      } else {
        toast.error("Failed to restore project on server.");
      }
    },

    assignSectionsToProject: async (projectId, sectionIds) => {
      if (!sectionIds || sectionIds.length === 0) return;

      // First try backend API batch assignment
      try {
        const updatedProject = await apiClient.assignSections(projectId, sectionIds);
        if (updatedProject && updatedProject.id) {
          const projects = get().projects;
          const exists = projects.some(p => p.id === projectId);
          const newProjects = exists
            ? projects.map(p => p.id === projectId ? { ...p, ...updatedProject } : p)
            : [...projects, updatedProject];

          set({
            projects: newProjects,
            activeProject: { ...(get().activeProject || {}), ...updatedProject },
          });
          const count = sectionIds.length;
          toast.success(`Assigned ${count} section${count === 1 ? '' : 's'} successfully!`);
          window.dispatchEvent(new CustomEvent('project-section-assigned', { detail: { projectId, sectionIds, project: updatedProject } }));
          return;
        }
      } catch (err) {
        console.error('Failed to assign sections on backend:', err);
      }

      // Local optimistic update fallback
      const templates = get().templates.filter(t => sectionIds.includes(t.id));
      if (templates.length === 0) return;
      const projects = get().projects;
      const project = projects.find(p => p.id === projectId);
      if (!project) return;

      const currentSections = [...(project.assignedSections || [])];
      for (const t of templates) {
        const clonedSection = JSON.parse(JSON.stringify(t)) as TemplateSection;
        const existingIndex = currentSections.findIndex(
          s => s.id === clonedSection.id ||
               (clonedSection.versionGroupId && s.versionGroupId === clonedSection.versionGroupId) ||
               (s.label && clonedSection.label && s.label.trim().toLowerCase() === clonedSection.label.trim().toLowerCase())
        );
        if (existingIndex >= 0) {
          currentSections[existingIndex] = clonedSection;
        } else {
          currentSections.push(clonedSection);
        }
      }

      const updatedProject = {
        ...project,
        assignedSections: currentSections,
      };

      set({
        projects: projects.map(p => p.id === projectId ? updatedProject : p),
        activeProject: updatedProject,
      });
      toast.success(`Assigned ${templates.length} section(s)!`);
      window.dispatchEvent(new CustomEvent('project-section-assigned', { detail: { projectId, sectionIds, project: updatedProject } }));
    },

    assignSectionToProject: async (projectId, sectionId) => {
      return get().assignSectionsToProject(projectId, [sectionId]);
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

    // --- Templates ---

    createTemplateSection: async (sectionData) => {
      const tempId = `ts_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const newSection: TemplateSection = {
        ...sectionData,
        id: tempId,
        categories: [],
      };
      const templates = [...get().templates, newSection];
      set({ templates });
      toast.success(`Section "${newSection.label}" created!`);
      const created = await apiClient.createSection(sectionData);
      if (created && created.id) {
        await get().fetchTemplates(true);
      }
    },

    updateTemplateSection: async (id, updates) => {
      const templates = get().templates;
      const section = templates.find(s => s.id === id);
      if (section) {
        Object.assign(section, updates);
        const projects = get().projects;
        const { newProjects, updated } = syncProjectsWithTemplates(templates, projects);
        set({ templates: [...templates], projects: updated ? newProjects : projects });
        toast.success("Section updated!");
        await apiClient.updateSection(id, updates);
      }
    },

    deleteTemplateSection: async (id) => {
      const section = get().templates.find(s => s.id === id);
      const label = section?.label || 'Section';
      const templates = get().templates.filter(s => s.id !== id);
      set({ templates });
      toast.success(`Section "${label}" deleted!`);
      await apiClient.deleteSection(id);
    },

    publishNewSectionVersion: async (sectionId, changelog) => {
      const res = await apiClient.publishSectionVersion(sectionId, changelog);
      if (res && res.id) {
        toast.success(`Version ${res.version} published successfully!`);
        // Optimistically update store templates immediately
        const currentTemplates = get().templates;
        const vGroupId = res.versionGroupId || res.id;
        const updatedTemplates = currentTemplates.map(t => {
          if ((t.versionGroupId && t.versionGroupId === vGroupId) || t.id === sectionId) {
            return { ...t, isLatest: false, status: 'archived' };
          }
          return t;
        });
        const existingIdx = updatedTemplates.findIndex(t => t.id === res.id);
        if (existingIdx >= 0) {
          updatedTemplates[existingIdx] = res;
        } else {
          updatedTemplates.push(res);
        }
        set({ templates: updatedTemplates });

        // Force background refresh from server
        await get().fetchTemplates(true);
        return res;
      } else {
        toast.error("Failed to publish new section version.");
        return null;
      }
    },

    createTemplateCategory: async (sectionId, categoryData) => {
      const templates = get().templates;
      const section = templates.find(s => s.id === sectionId);
      if (!section) return;
      const tempId = `tc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const newCategory: TemplateCategory = {
        ...categoryData,
        id: tempId,
        columns: [],
        groups: [],
      };

      const updatedTemplates = templates.map(s => {
        if (s.id === sectionId) {
          return {
            ...s,
            categories: [...(s.categories || []), newCategory],
          };
        }
        return s;
      });

      const projects = get().projects;
      const { newProjects, updated } = syncProjectsWithTemplates(updatedTemplates, projects);
      set({ templates: updatedTemplates, projects: updated ? newProjects : projects });
      toast.success(`Category "${newCategory.label}" created!`);

      const created = await apiClient.createCategory(sectionId, categoryData);
      if (created && created.id) {
        await get().fetchTemplates(true);
      }
    },

    updateTemplateCategory: async (sectionId, categoryId, updates) => {
      const templates = get().templates;
      const updatedTemplates = templates.map(s => {
        if (s.id === sectionId) {
          return {
            ...s,
            categories: (s.categories || []).map(c => c.id === categoryId ? { ...c, ...updates } : c),
          };
        }
        return s;
      });

      const projects = get().projects;
      const { newProjects, updated } = syncProjectsWithTemplates(updatedTemplates, projects);
      set({ templates: updatedTemplates, projects: updated ? newProjects : projects });
      toast.success("Category updated!");
      await apiClient.updateCategory(categoryId, updates);
    },

    deleteTemplateCategory: async (sectionId, categoryId) => {
      const templates = get().templates;
      const updatedTemplates = templates.map(s => {
        if (s.id === sectionId) {
          return {
            ...s,
            categories: (s.categories || []).filter(c => c.id !== categoryId),
          };
        }
        return s;
      });

      const projects = get().projects;
      const { newProjects, updated } = syncProjectsWithTemplates(updatedTemplates, projects);
      set({ templates: updatedTemplates, projects: updated ? newProjects : projects });
      toast.success("Category deleted!");
      await apiClient.deleteCategory(categoryId);
    },

    createTemplateGroup: async (sectionId, categoryId, groupData) => {
      const templates = get().templates;
      const tempId = `tg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const newGroup: TemplateGroup = {
        ...groupData,
        id: tempId,
        columns: [],
      };

      const updatedTemplates = templates.map(s => {
        if (s.id === sectionId) {
          return {
            ...s,
            categories: (s.categories || []).map(c => {
              if (c.id === categoryId) {
                return {
                  ...c,
                  groups: [...(c.groups || []), newGroup],
                };
              }
              return c;
            }),
          };
        }
        return s;
      });

      const projects = get().projects;
      const { newProjects, updated } = syncProjectsWithTemplates(updatedTemplates, projects);
      set({ templates: updatedTemplates, projects: updated ? newProjects : projects });
      toast.success(`Subcategory "${newGroup.label}" created!`);

      const created = await apiClient.createGroup(categoryId, groupData);
      if (created && created.id) {
        const finalTemplates = get().templates.map(s => {
          if (s.id === sectionId) {
            return {
              ...s,
              categories: (s.categories || []).map(c => {
                if (c.id === categoryId) {
                  return {
                    ...c,
                    groups: (c.groups || []).map(g => g.id === tempId ? { ...g, id: created.id } : g),
                  };
                }
                return c;
              }),
            };
          }
          return s;
        });
        set({ templates: finalTemplates });
      }
    },

    updateTemplateGroup: async (sectionId, categoryId, groupId, updates) => {
      const templates = get().templates;
      const updatedTemplates = templates.map(s => {
        if (s.id === sectionId) {
          return {
            ...s,
            categories: (s.categories || []).map(c => {
              if (c.id === categoryId) {
                return {
                  ...c,
                  groups: (c.groups || []).map(g => g.id === groupId ? { ...g, ...updates } : g),
                };
              }
              return c;
            }),
          };
        }
        return s;
      });

      const projects = get().projects;
      const { newProjects, updated } = syncProjectsWithTemplates(updatedTemplates, projects);
      set({ templates: updatedTemplates, projects: updated ? newProjects : projects });
      toast.success("Subcategory updated!");
      await apiClient.updateGroup(groupId, updates);
    },

    deleteTemplateGroup: async (sectionId, categoryId, groupId) => {
      const templates = get().templates;
      const updatedTemplates = templates.map(s => {
        if (s.id === sectionId) {
          return {
            ...s,
            categories: (s.categories || []).map(c => {
              if (c.id === categoryId) {
                return {
                  ...c,
                  groups: (c.groups || []).filter(g => g.id !== groupId),
                };
              }
              return c;
            }),
          };
        }
        return s;
      });

      const projects = get().projects;
      const { newProjects, updated } = syncProjectsWithTemplates(updatedTemplates, projects);
      set({ templates: updatedTemplates, projects: updated ? newProjects : projects });
      toast.success("Subcategory deleted!");
      await apiClient.deleteGroup(groupId);
    },

    createTemplateColumn: async (sectionId, categoryId, groupId, columnData) => {
      const templates = get().templates;
      const section = templates.find(s => s.id === sectionId);
      if (!section) return;

      const tempId = `col_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const newColumn: TemplateColumn = {
        ...columnData,
        id: tempId,
      };

      if (!section.columns) section.columns = [];
      section.columns.push(newColumn);

      // Also sync category for fallback if category exists
      const category = section.categories?.find(c => c.id === categoryId);
      if (category) {
        if (!category.columns) category.columns = [];
        category.columns.push(newColumn);
      }

      const projects = get().projects;
      const { newProjects, updated } = syncProjectsWithTemplates(templates, projects);
      set({ templates: [...templates], projects: updated ? newProjects : projects });
      toast.success(`Column "${newColumn.name}" created!`);

      const created = await apiClient.createColumn(sectionId, groupId, columnData);
      if (created && created.id) {
        newColumn.id = created.id;
        set({ templates: [...get().templates] });
      }
    },

    updateTemplateColumn: async (sectionId, categoryId, groupId, columnId, updates) => {
      const templates = get().templates;
      const section = templates.find(s => s.id === sectionId);
      if (!section) return;

      // Update section level column
      if (section.columns) {
        const secCol = section.columns.find(c => c.id === columnId);
        if (secCol) Object.assign(secCol, updates);
      }

      // Also update category level fallback
      const category = section.categories?.find(c => c.id === categoryId);
      if (category && category.columns) {
        const catCol = category.columns.find(c => c.id === columnId);
        if (catCol) Object.assign(catCol, updates);
      }

      const projects = get().projects;
      const { newProjects, updated } = syncProjectsWithTemplates(templates, projects);
      set({ templates: [...templates], projects: updated ? newProjects : projects });
      await apiClient.updateColumn(columnId, updates);
    },

    deleteTemplateColumn: async (sectionId, categoryId, groupId, columnId) => {
      const templates = get().templates;
      const section = templates.find(s => s.id === sectionId);
      if (!section) return;

      if (section.columns) {
        section.columns = section.columns.filter(c => c.id !== columnId);
      }

      const category = section.categories?.find(c => c.id === categoryId);
      if (category && category.columns) {
        category.columns = category.columns.filter(c => c.id !== columnId);
      }

      const projects = get().projects;
      const { newProjects, updated } = syncProjectsWithTemplates(templates, projects);
      set({ templates: [...templates], projects: updated ? newProjects : projects });
      await apiClient.deleteColumn(columnId);
    }
  };
});
