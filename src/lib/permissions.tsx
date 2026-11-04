import * as React from 'react';
import { useAppStore } from '../store';

export type UserRole =
  | 'super_admin'
  | 'project_lead'
  | 'assessment_specialist'
  | 'customer';

export type SubscriptionStatus = 'none' | 'active' | 'expired' | 'cancelled';

export type AppModule =
  | 'overall-analytics'
  | 'analytics'
  | 'projects'
  | 'section-maker'
  | 'orders'
  | 'payments'
  | 'users'
  | 'inquiries'
  | 'settings'
  | 'landing-cms'
  | 'profile';

export type AppPermission =
  | 'manage_users'
  | 'manage_settings'
  | 'create_project'
  | 'edit_project_metadata'
  | 'delete_project'
  | 'manage_templates'
  | 'edit_project_data'
  | 'view_dashboard'
  | 'export_reports'
  | 'manage_cms'
  | 'manage_orders'
  | 'manage_payments'
  | 'run_ingestion'
  | 'run_calibration'
  | 'assign_sections';

/**
 * Static Role-Based Module Access Matrix.
 * Customer paid access also requires subscriptionStatus === 'active' for Projects.
 */
export const ROLE_MODULE_ACCESS: Record<UserRole, AppModule[]> = {
  super_admin: [
    'overall-analytics',
    'analytics',
    'projects',
    'section-maker',
    'orders',
    'payments',
    'users',
    'inquiries',
    'settings',
    'landing-cms',
    // no 'profile' — customer-only
  ],
  project_lead: [
    'overall-analytics',
    'analytics',
    'projects',
    'orders',
    'landing-cms',
  ],
  assessment_specialist: [
    'overall-analytics',
    'analytics',
    'projects',
  ],
  customer: [
    'profile',
    'projects',
    'analytics', // Dashboard — scoped to their projects only via GET /projects
  ],
};

const ROLE_PERMISSIONS: Record<UserRole, AppPermission[]> = {
  super_admin: [
    'manage_users',
    'manage_settings',
    'create_project',
    'edit_project_metadata',
    'delete_project',
    'manage_templates',
    'edit_project_data',
    'view_dashboard',
    'export_reports',
    'manage_cms',
    'manage_orders',
    'manage_payments',
    'run_ingestion',
    'run_calibration',
    'assign_sections',
  ],
  project_lead: [
    'create_project',
    'edit_project_metadata',
    'edit_project_data',
    'view_dashboard',
    'export_reports',
    'manage_cms',
    'manage_orders',
    'run_ingestion',
    'run_calibration',
    'assign_sections',
  ],
  assessment_specialist: [
    'edit_project_data',
    'view_dashboard',
    'export_reports',
    'run_ingestion',
    'run_calibration',
    'assign_sections',
  ],
  customer: [
    'create_project', // Within paid package slot allowance (enforced by API)
    'edit_project_metadata', // Own projects only (ownership enforced by API)
    'view_dashboard',
    'export_reports',
    'assign_sections', // Option B: assign published catalog sections to own projects only
  ],
};

/** Map legacy role strings (JWT / DB) to current roles. */
function normalizeRole(role: string | undefined | null): UserRole | null {
  if (!role) return null;
  const r = role.toLowerCase().trim();
  if (r === 'client_viewer' || r === 'viewer' || r === 'subscriber') return 'customer';
  return r as UserRole;
}

export function hasActiveSubscription(subscriptionStatus?: string | null): boolean {
  return String(subscriptionStatus || '').toLowerCase() === 'active';
}

export function isCustomerRole(role: string | undefined | null): boolean {
  return normalizeRole(role) === 'customer';
}

/** Customer home: Checkout if unpaid; Profile once subscribed. */
export function getCustomerHomePath(subscriptionStatus?: string | null): string {
  return hasActiveSubscription(subscriptionStatus) ? '/profile' : '/checkout';
}

/** Post-login / fallback landing by role. */
export function getPostLoginPath(
  role?: string | null,
  subscriptionStatus?: string | null,
): string {
  if (isCustomerRole(role)) return getCustomerHomePath(subscriptionStatus);
  return '/projects';
}

/**
 * Checks if a user role can access a specific module.
 * For customers: Projects requires active subscription; Profile always.
 */
export function canAccessModule(
  role: string | undefined | null,
  moduleKey: AppModule,
  subscriptionStatus?: string | null,
): boolean {
  const r = normalizeRole(role);
  if (!r) return false;
  // Profile is never an admin module (even super_admin)
  if (moduleKey === 'profile') return r === 'customer';
  if (r === 'super_admin') return true;
  if (!(ROLE_MODULE_ACCESS[r] || []).includes(moduleKey)) return false;
  if (r === 'customer' && (moduleKey === 'projects' || moduleKey === 'analytics')) {
    return hasActiveSubscription(subscriptionStatus);
  }
  return true;
}

export function hasPermission(role: string | undefined | null, permission: AppPermission): boolean {
  const r = normalizeRole(role);
  if (!r) return false;
  if (r === 'super_admin') return true;
  return (ROLE_PERMISSIONS[r] || []).includes(permission);
}

export function canAccessRoute(
  role: string | undefined | null,
  pathname: string,
  subscriptionStatus?: string | null,
): boolean {
  const r = normalizeRole(role);
  if (!r) return false;

  if (r === 'super_admin') return true;

  // Profile is customer-only — staff/admin must not use this surface
  if (pathname.startsWith('/profile')) {
    return r === 'customer';
  }
  if (pathname.startsWith('/checkout')) return true;
  if (pathname.startsWith('/users')) return canAccessModule(r, 'users', subscriptionStatus);
  if (pathname.startsWith('/inquiries')) return canAccessModule(r, 'inquiries', subscriptionStatus);
  if (pathname.startsWith('/settings')) return canAccessModule(r, 'settings', subscriptionStatus);
  if (pathname.startsWith('/section-maker')) return canAccessModule(r, 'section-maker', subscriptionStatus);
  if (pathname.startsWith('/payments')) return canAccessModule(r, 'payments', subscriptionStatus);
  if (pathname.startsWith('/orders')) return canAccessModule(r, 'orders', subscriptionStatus);
  if (pathname.startsWith('/landing-cms')) return canAccessModule(r, 'landing-cms', subscriptionStatus);
  if (pathname.startsWith('/projects')) return canAccessModule(r, 'projects', subscriptionStatus);
  if (pathname.startsWith('/overall-analytics')) return canAccessModule(r, 'overall-analytics', subscriptionStatus);
  if (pathname.startsWith('/analytics')) return canAccessModule(r, 'analytics', subscriptionStatus);

  return true;
}

export function useCanAccessModule(moduleKey: AppModule): boolean {
  const currentUser = useAppStore((s) => s.currentUser);
  return canAccessModule(currentUser?.role, moduleKey, currentUser?.subscriptionStatus);
}

export function useHasPermission(permission: AppPermission): boolean {
  const currentUser = useAppStore((s) => s.currentUser);
  return hasPermission(currentUser?.role, permission);
}

/** Alias used by ProjectsPage and other modules */
export function usePermission(permission: AppPermission): boolean {
  return useHasPermission(permission);
}

export function useHasActiveSubscription(): boolean {
  const currentUser = useAppStore((s) => s.currentUser);
  return hasActiveSubscription(currentUser?.subscriptionStatus);
}

export function useIsCustomer(): boolean {
  const currentUser = useAppStore((s) => s.currentUser);
  return isCustomerRole(currentUser?.role);
}
