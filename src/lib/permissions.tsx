import * as React from 'react';
import { useAppStore } from '../store';

export type UserRole =
  | 'super_admin'
  | 'project_lead'
  | 'assessment_specialist'
  | 'client_viewer';

export type AppModule =
  | 'overall-analytics'
  | 'analytics'
  | 'projects'
  | 'section-maker'
  | 'orders'
  | 'payments'
  | 'users'
  | 'settings'
  | 'landing-cms';

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
  | 'manage_payments';

/**
 * Static Role-Based Module Access Matrix:
 * • super_admin: Complete access to all 9 modules
 * • project_lead: Projects, Dashboard, Overall Analytics, Orders, and Landing CMS
 * • assessment_specialist: Projects, Dashboard, and Overall Analytics
 * • client_viewer: Projects, Dashboard, and Overall Analytics (read-only)
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
    'settings',
    'landing-cms',
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
  client_viewer: [
    'overall-analytics',
    'analytics',
    'projects',
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
  ],
  project_lead: [
    'create_project',
    'edit_project_metadata',
    'edit_project_data',
    'view_dashboard',
    'export_reports',
    'manage_cms',
    'manage_orders',
  ],
  assessment_specialist: [
    'edit_project_data',
    'view_dashboard',
    'export_reports',
  ],
  client_viewer: [
    'view_dashboard',
    'export_reports',
  ],
};

/**
 * Checks if a user role can access a specific module.
 */
export function canAccessModule(role: string | undefined | null, moduleKey: AppModule): boolean {
  if (!role) return false;
  const r = role.toLowerCase().trim() as UserRole;
  if (r === 'super_admin') return true;
  return (ROLE_MODULE_ACCESS[r] || []).includes(moduleKey);
}

/**
 * Checks if a user role has permission to execute an action.
 */
export function hasPermission(role: string | undefined | null, permission: AppPermission): boolean {
  if (!role) return false;
  const r = role.toLowerCase().trim() as UserRole;
  if (r === 'super_admin') return true;
  return (ROLE_PERMISSIONS[r] || []).includes(permission);
}

/**
 * Route guard based strictly on role module authorization.
 */
export function canAccessRoute(role: string | undefined | null, pathname: string): boolean {
  if (!role) return false;
  const r = role.toLowerCase().trim() as UserRole;

  if (r === 'super_admin') return true;

  if (pathname.startsWith('/users')) return canAccessModule(r, 'users');
  if (pathname.startsWith('/settings')) return canAccessModule(r, 'settings');
  if (pathname.startsWith('/section-maker')) return canAccessModule(r, 'section-maker');
  if (pathname.startsWith('/payments')) return canAccessModule(r, 'payments');
  if (pathname.startsWith('/orders')) return canAccessModule(r, 'orders');
  if (pathname.startsWith('/landing-cms')) return canAccessModule(r, 'landing-cms');

  return true;
}

/**
 * React hook to check permissions of the current logged-in user.
 */
export function usePermission(permission: AppPermission): boolean {
  const { currentUser } = useAppStore();
  return React.useMemo(() => {
    return hasPermission(currentUser?.role, permission);
  }, [currentUser?.role, permission]);
}

/**
 * React hook to check module access of the current logged-in user.
 */
export function useModuleAccess(moduleKey: AppModule): boolean {
  const { currentUser } = useAppStore();
  return React.useMemo(() => {
    return canAccessModule(currentUser?.role, moduleKey);
  }, [currentUser?.role, moduleKey]);
}

/**
 * Declarative component for conditional rendering.
 */
interface CanProps {
  do: AppPermission;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function Can({ do: permission, fallback = null, children }: CanProps) {
  const allowed = usePermission(permission);
  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}
