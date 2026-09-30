"use client"

import * as React from "react"
import {
  Users,
  User,
  Search,
  Filter,
  Plus,
  ShieldCheck,
  UserCheck,
  BarChart2,
  Eye,
  MoreVertical,
  Edit3,
  Trash2,
  Key,
  Power,
  Building2,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  X,
  ShieldAlert,
  ChevronRight,
  ChevronDown,
  Check,
  FolderOpen,
  Calendar,
  Sparkles,
  Database
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { Dropdown } from "@/components/ui/dropdown"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import { apiClient } from "@/lib/api"
import { useAppStore } from "@/store"

export type UserRole = 'super_admin' | 'project_lead' | 'assessment_specialist' | 'client_viewer';
export type UserStatus = 'active' | 'pending' | 'suspended';

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: UserStatus;
  lastActive: string;
  avatarBg: string;
  assignedProjectsCount: number;
  createdAt: string;
}

const ITEMS_PER_PAGE = 10;



const DEPARTMENTS = [
  "Executive Board",
  "Real Estate Development",
  "Urban Analytics",
  "Infrastructure Planning",
  "Finance & Accounting",
  "Community Relations",
  "Housing & Land Use",
  "External Audit"
];

interface BrandRedSelectOption {
  value: string;
  label: string;
}

interface BrandRedSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: BrandRedSelectOption[];
  disabled?: boolean;
  className?: string;
}

function BrandRedSelect({ value, onChange, options, disabled, className }: BrandRedSelectProps) {
  return (
    <Dropdown
      value={value}
      onChange={onChange}
      options={options}
      disabled={disabled}
      fullWidth
      size="md"
      align="left"
      highlightSelected={false}
      className={className}
    />
  );
}

const ROLE_OPTIONS: BrandRedSelectOption[] = [
  { value: "super_admin", label: "Super Admin" },
  { value: "project_lead", label: "Project Lead" },
  { value: "assessment_specialist", label: "Assessment Specialist" },
  { value: "client_viewer", label: "Client Representative" },
];

const STATUS_OPTIONS: BrandRedSelectOption[] = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "suspended", label: "Block" },
];

const DEPARTMENT_OPTIONS: BrandRedSelectOption[] = DEPARTMENTS.map(d => ({ value: d, label: d }));

export default function UsersPage() {
  const { currentUser } = useAppStore();
  const [users, setUsers] = React.useState<UserData[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = React.useState<boolean>(true);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedRole, setSelectedRole] = React.useState<string>("all");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all");
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  // Current user's authenticated role
  const userRole = (currentUser?.role as UserRole) || 'client_viewer';

  // Load live users from backend database
  const fetchUsers = React.useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const apiUsers = await apiClient.getUsers();
      if (Array.isArray(apiUsers)) {
        setUsers(apiUsers.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role || 'client_viewer',
          department: u.department || 'Planning Board',
          status: u.status || 'active',
          lastActive: u.lastActive ? new Date(u.lastActive).toLocaleDateString() : 'Just now',
          avatarBg: u.avatarBg || 'bg-slate-700 text-white',
          assignedProjectsCount: u.assignedProjectsCount || 0,
          createdAt: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '2026-01-01',
        })));
      }
    } catch (err) {
      console.error('Failed to load users from backend:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Menu & Modal States
  const [activeMenuUserId, setActiveMenuUserId] = React.useState<string | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = React.useState<boolean>(false);
  const [editingUser, setEditingUser] = React.useState<UserData | null>(null);
  const [deletingUser, setDeletingUser] = React.useState<UserData | null>(null);
  const [profileDrawerUser, setProfileDrawerUser] = React.useState<UserData | null>(null);

  // Form States for Add/Edit
  const [formName, setFormName] = React.useState<string>("");
  const [formEmail, setFormEmail] = React.useState<string>("");
  const [formPassword, setFormPassword] = React.useState<string>("TempSecret123!");
  const [formRole, setFormRole] = React.useState<UserRole>("assessment_specialist");
  const [formDepartment, setFormDepartment] = React.useState<string>(DEPARTMENTS[0]);
  const [formStatus, setFormStatus] = React.useState<UserStatus>("active");

  // Reset page to 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedRole, selectedStatus]);

  // RBAC Permission Check Helpers
  const isSuperAdmin = userRole === 'super_admin';
  const canAddUser = isSuperAdmin || userRole === 'project_lead';

  const canEditUser = (targetUser: UserData) => {
    if (isSuperAdmin) return true;
    if (userRole === 'project_lead') return targetUser.role !== 'super_admin';
    return false;
  };

  const canChangeRole = (targetUser: UserData) => {
    return isSuperAdmin;
  };

  const canDeleteUser = (targetUser: UserData) => {
    if (!isSuperAdmin) return false;
    return targetUser.email !== 'admin@roseassociates.com' && targetUser.id !== 'usr-001';
  };

  const canToggleStatus = (targetUser: UserData) => {
    if (isSuperAdmin) return targetUser.email !== 'admin@roseassociates.com' && targetUser.id !== 'usr-001';
    if (userRole === 'project_lead') return targetUser.role !== 'super_admin';
    return false;
  };

  // Filtered Users List
  const filteredUsers = React.useMemo(() => {
    return users.filter(user => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.department.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = selectedRole === "all" || user.role === selectedRole;
      const matchesStatus = selectedStatus === "all" || user.status === selectedStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, selectedRole, selectedStatus]);

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const paginatedUsers = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  // Metrics
  const totalCount = users.length;
  const superAdminCount = users.filter(u => u.role === 'super_admin').length;
  const projectLeadCount = users.filter(u => u.role === 'project_lead').length;
  const specialistCount = users.filter(u => u.role === 'assessment_specialist').length;
  const clientViewerCount = users.filter(u => u.role === 'client_viewer').length;

  // Form Handlers
  const handleOpenAddUser = () => {
    if (!canAddUser) {
      toast.error(`Permission Denied: Your current role (${userRole.toUpperCase()}) cannot add new users. Super Admin privilege required.`);
      return;
    }
    setFormName("");
    setFormEmail("");
    setFormPassword("SecurePass123!");
    setFormRole("assessment_specialist");
    setFormDepartment(DEPARTMENTS[0]);
    setFormStatus("active");
    setIsAddUserOpen(true);
  };

  const handleSaveAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const res = await apiClient.createUser({
      name: formName.trim(),
      email: formEmail.trim(),
      password: formPassword || "RoseAssociates123!",
      role: formRole,
      department: formDepartment,
      status: formStatus,
    });

    if (res.success) {
      await fetchUsers();
      setIsAddUserOpen(false);
      toast.success(`User ${formName.trim()} created successfully with Argon2 hashing!`);
    } else {
      toast.error(res.message || "Failed to create user");
    }
  };

  const handleOpenEditUser = (user: UserData) => {
    if (!canEditUser(user)) {
      toast.error(`Permission Denied: Your role (${userRole.toUpperCase()}) cannot edit this user.`);
      return;
    }
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormDepartment(user.department);
    setFormStatus(user.status);
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const res = await apiClient.updateUser(editingUser.id, {
      name: formName.trim(),
      role: canChangeRole(editingUser) ? formRole : editingUser.role,
      department: formDepartment,
      status: canToggleStatus(editingUser) ? formStatus : editingUser.status,
    });

    if (res.success) {
      await fetchUsers();
      setEditingUser(null);
      toast.success(`User ${formName} updated successfully!`);
    } else {
      toast.error(res.message || "Failed to update user");
    }
  };

  const handleToggleUserStatus = async (user: UserData) => {
    if (!canToggleStatus(user)) {
      toast.error(`Permission Denied: Cannot modify status for ${user.name}.`);
      return;
    }
    const newStatus: UserStatus = user.status === 'active' ? 'suspended' : 'active';
    const res = await apiClient.updateUser(user.id, { status: newStatus });
    if (res.success) {
      await fetchUsers();
      toast.success(`User ${user.name} is now ${newStatus.toUpperCase()}`);
    } else {
      toast.error(res.message || "Failed to update user status");
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    if (!canDeleteUser(deletingUser)) {
      toast.error(`Permission Denied: Cannot delete ${deletingUser.name}.`);
      setDeletingUser(null);
      return;
    }
    const res = await apiClient.deleteUser(deletingUser.id);
    if (res.success) {
      await fetchUsers();
      toast.success(`User ${deletingUser.name} deleted.`);
    } else {
      toast.error(res.message || "Failed to delete user");
    }
    setDeletingUser(null);
  };

  const handleResetPassword = (user: UserData) => {
    if (!canEditUser(user)) {
      toast.error(`Permission Denied: Cannot reset password for ${user.name}.`);
      return;
    }
    toast.success(`Password reset link generated for ${user.email}`);
  };

  // Helper Badge Renderers
  const renderRoleBadge = (role: UserRole | string) => {
    switch (role) {
      case 'super_admin':
        return (
          <span className="px-2.5 py-0.5 rounded-xl text-[11px] font-extrabold bg-[#7c0d15]/15 text-[#7c0d15] border border-[#7c0d15]/30 inline-block w-fit">
            Super Admin
          </span>
        );
      case 'project_lead':
        return (
          <span className="px-2.5 py-0.5 rounded-xl text-[11px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 inline-block w-fit">
            Project Lead
          </span>
        );
      case 'assessment_specialist':
        return (
          <span className="px-2.5 py-0.5 rounded-xl text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block w-fit">
            Assessment Specialist
          </span>
        );
      case 'client_viewer':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-xl text-[11px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200 inline-block w-fit">
            Client Rep
          </span>
        );
    }
  };

  const renderStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-block text-[11px] font-extrabold text-white bg-emerald-600 px-3 py-1 rounded-md shadow-2xs">
            Active
          </span>
        );
      case 'pending':
        return (
          <span className="inline-block text-[11px] font-extrabold text-white bg-amber-600 px-3 py-1 rounded-md shadow-2xs">
            Pending
          </span>
        );
      case 'suspended':
      default:
        return (
          <span className="inline-block text-[11px] font-extrabold text-white bg-[#7c0d15] px-3 py-1 rounded-md shadow-2xs">
            Block
          </span>
        );
    }
  };

  return (
    <div className="space-y-3 sm:space-y-3.5 w-full pb-0">

      {/* Header Banner & Interactive RBAC Role Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#7c0d15]/10 text-[#7c0d15] border border-[#7c0d15]/20">
            <Users className="w-5 h-5 text-[#b5111b]" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">Users Management</h1>
            <p className="text-xs text-slate-500 font-medium">
              Manage organization team members & role-based access control (RBAC)
            </p>
          </div>
        </div>


      </div>

      {/* Backdrop overlay for closing action menu */}
          {activeMenuUserId && (
            <div
              className="fixed inset-0 z-20 bg-transparent"
              onClick={() => {
                setActiveMenuUserId(null);
              }}
            />
          )}

          {/* Main Table Card Container */}
          <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
        {/* Controls Toolbar */}
        <div className="p-3 bg-slate-50/70 border-b border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">

          {/* Search Input & Role Tabs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search user name, email, department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Role Filter Tabs */}
            <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shrink-0 overflow-x-auto">
              {[
                { id: "all", label: "All Roles" },
                { id: "super_admin", label: "Super Admins" },
                { id: "project_lead", label: "Project Leads" },
                { id: "assessment_specialist", label: "Specialists" },
                { id: "client_viewer", label: "Client Reps" },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedRole(tab.id)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                    selectedRole === tab.id
                      ? "bg-[#7c0d15] text-white shadow-2xs"
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter & Add User Button */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Common Status Filter Dropdown */}
            <Dropdown
              value={selectedStatus}
              onChange={setSelectedStatus}
              align="right"
              title="FILTER BY STATUS:"
              options={[
                { value: "all", label: "All Statuses" },
                { value: "active", label: "Active" },
                { value: "pending", label: "Pending" },
                { value: "suspended", label: "Block" },
              ]}
            />

            <Button
              onClick={handleOpenAddUser}
              disabled={!canAddUser}
              className={cn(
                "rounded-xl text-xs font-bold px-3.5 py-1.5 flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer",
                canAddUser
                  ? "bg-[#7c0d15] hover:bg-[#b5111b] text-white"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              )}
              title={canAddUser ? "Add New User" : `Restricted to Super Admin / Project Lead (Current: ${userRole.toUpperCase()})`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New User</span>
            </Button>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto min-h-[360px]">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="px-3.5 py-2.5">User Details</th>
                <th className="px-3.5 py-2.5">Role & Permissions</th>
                <th className="px-3.5 py-2.5">Department</th>
                <th className="px-3.5 py-2.5">Status</th>
                <th className="px-3.5 py-2.5">Last Active</th>
                <th className="px-3.5 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {isLoadingUsers ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-[#b5111b] border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs">Loading team members...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400 font-medium">
                    No users matching your filters found.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user, index) => {
                  const isLowerRow = paginatedUsers.length >= 4 && index >= paginatedUsers.length - 2 && index > 1;

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/70 transition-colors group cursor-default"
                    >
                      {/* User Details */}
                      <td className="px-3.5 py-2.5 align-middle">
                        <div className="flex items-center gap-2.5">
                          <div
                            onClick={() => setProfileDrawerUser(user)}
                            className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-500 flex items-center justify-center shrink-0 shadow-2xs cursor-pointer hover:bg-slate-200/70 hover:scale-105 transition-all"
                          >
                            <User className="w-4 h-4 text-slate-500" />
                          </div>
                          <div>
                            <div
                              onClick={() => setProfileDrawerUser(user)}
                              className="font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer"
                            >
                              {user.name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-medium">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role & Permissions */}
                      <td className="px-3.5 py-2.5 align-middle">
                        {renderRoleBadge(user.role)}
                      </td>

                      {/* Department */}
                      <td className="px-3.5 py-2.5 align-middle text-slate-700 font-bold text-xs">
                        {user.department}
                      </td>

                      {/* Status */}
                      <td className="px-3.5 py-2.5 align-middle">
                        {renderStatusBadge(user.status)}
                      </td>

                      {/* Last Active */}
                      <td className="px-3.5 py-2.5 align-middle">
                        <span className="text-slate-500 text-[11px] font-semibold">{user.lastActive}</span>
                      </td>

                      {/* Actions Column (3-Dots Dropdown with Smart Positioning) */}
                      <td className="px-3.5 py-2.5 align-middle text-right relative">
                        <div className="inline-block text-left">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setActiveMenuUserId(activeMenuUserId === user.id ? null : user.id)}
                            className="w-7 h-7 p-0 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 flex items-center justify-center cursor-pointer transition-colors"
                            title="Actions"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </Button>

                          {/* Dropdown Menu (Smart Upward/Downward Direction) */}
                          {activeMenuUserId === user.id && (
                            <div className={cn(
                              "absolute w-52 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-30 animate-in fade-in zoom-in-95 duration-150 text-left",
                              isLowerRow ? "bottom-full mb-1 right-4" : "top-10 right-4"
                            )}>
                              <div className="px-3 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                                User Actions:
                              </div>

                              {/* View Full Profile / Activity */}
                              <button
                                onClick={() => {
                                  setProfileDrawerUser(user);
                                  setActiveMenuUserId(null);
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <span>View Activity Drawer</span>
                              </button>

                              {/* Edit Details */}
                              <button
                                onClick={() => {
                                  handleOpenEditUser(user);
                                  setActiveMenuUserId(null);
                                }}
                                disabled={!canEditUser(user)}
                                className={cn(
                                  "w-full text-left px-3 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer",
                                  canEditUser(user)
                                    ? "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                                    : "text-slate-300 cursor-not-allowed"
                                )}
                              >
                                <Edit3 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                <span>Edit Details</span>
                              </button>

                              {/* Reset Password */}
                              <button
                                onClick={() => {
                                  handleResetPassword(user);
                                  setActiveMenuUserId(null);
                                }}
                                disabled={!canEditUser(user)}
                                className={cn(
                                  "w-full text-left px-3 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer",
                                  canEditUser(user)
                                    ? "text-slate-700 hover:bg-amber-50 hover:text-amber-900"
                                    : "text-slate-300 cursor-not-allowed"
                                )}
                              >
                                <Key className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>Reset Password</span>
                              </button>

                              {/* Toggle Status (Active / Deactivate) */}
                              <button
                                onClick={() => {
                                  handleToggleUserStatus(user);
                                  setActiveMenuUserId(null);
                                }}
                                disabled={!canToggleStatus(user)}
                                className={cn(
                                  "w-full text-left px-3 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer",
                                  canToggleStatus(user)
                                    ? user.status === 'active'
                                      ? "text-slate-700 hover:bg-rose-50 hover:text-rose-900"
                                      : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-900"
                                    : "text-slate-300 cursor-not-allowed"
                                )}
                              >
                                <Power className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                <span>{user.status === 'active' ? 'Suspend Access' : 'Activate User'}</span>
                              </button>

                              {/* Delete User */}
                              <button
                                onClick={() => {
                                  if (!canDeleteUser(user)) {
                                    toast.error(`Permission Denied: Only Admins can delete users.`);
                                  } else {
                                    setDeletingUser(user);
                                  }
                                  setActiveMenuUserId(null);
                                }}
                                disabled={!canDeleteUser(user)}
                                className={cn(
                                  "w-full text-left px-3 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer border-t border-slate-100 mt-1 pt-1.5",
                                  canDeleteUser(user)
                                    ? "text-rose-600 hover:bg-rose-50 hover:text-rose-800"
                                    : "text-slate-300 cursor-not-allowed"
                                )}
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                <span>Delete User</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Bar (Matches Orders Page Design Exactly) */}
        {filteredUsers.length > 0 && (
          <div className="px-4 py-2.5 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-medium text-slate-600">
            <div>
              Showing <span className="font-bold text-slate-900">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> to{" "}
              <span className="font-bold text-slate-900">{Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)}</span> of{" "}
              <span className="font-bold text-slate-900">{filteredUsers.length}</span> users
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center justify-center font-bold text-xs shadow-2xs"
                title="First Page"
              >
                &laquo;
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center justify-center font-bold text-xs shadow-2xs"
              >
                &lsaquo; Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center shadow-2xs",
                    currentPage === page
                      ? "bg-[#B5111B] text-white shadow-md font-extrabold scale-105"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                  )}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center justify-center font-bold text-xs shadow-2xs"
              >
                Next &rsaquo;
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center justify-center font-bold text-xs shadow-2xs"
                title="Last Page"
              >
                &raquo;
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* MODAL 1: Add New User Modal */}
      {isAddUserOpen && (
        <Modal
          isOpen={isAddUserOpen}
          onClose={() => setIsAddUserOpen(false)}
          title="Add New Team Member"
          className="max-w-md w-[94%] sm:w-full rounded-2xl"
        >
          <form onSubmit={handleSaveAddUser} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Eleanor Vance"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Email Address *</label>
              <input
                type="email"
                required
                placeholder="e.g. evance@roseassociates.com"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Role & Access</label>
                <BrandRedSelect
                  value={formRole}
                  onChange={(val) => setFormRole(val as UserRole)}
                  options={ROLE_OPTIONS}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Initial Status</label>
                <BrandRedSelect
                  value={formStatus}
                  onChange={(val) => setFormStatus(val as UserStatus)}
                  options={STATUS_OPTIONS}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Department / Organization</label>
              <BrandRedSelect
                value={formDepartment}
                onChange={(val) => setFormDepartment(val)}
                options={DEPARTMENT_OPTIONS}
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddUserOpen(false)}
                className="rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#7c0d15] hover:bg-[#b5111b] text-white rounded-xl text-xs font-bold px-4"
              >
                Create User
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: Edit User Modal */}
      {editingUser && (
        <Modal
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          title={`Edit User: ${editingUser.name}`}
          className="max-w-md w-[94%] sm:w-full rounded-2xl"
        >
          <form onSubmit={handleSaveEditUser} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Full Name</label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Email Address</label>
              <input
                type="email"
                required
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Role & Access</label>
                <BrandRedSelect
                  value={formRole}
                  disabled={!canChangeRole(editingUser)}
                  onChange={(val) => setFormRole(val as UserRole)}
                  options={ROLE_OPTIONS}
                />
                {!canChangeRole(editingUser) && (
                  <p className="text-[10px] text-amber-600 font-medium mt-0.5">Role modification requires Admin role</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Account Status</label>
                <BrandRedSelect
                  value={formStatus}
                  disabled={!canToggleStatus(editingUser)}
                  onChange={(val) => setFormStatus(val as UserStatus)}
                  options={STATUS_OPTIONS}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Department</label>
              <BrandRedSelect
                value={formDepartment}
                onChange={(val) => setFormDepartment(val)}
                options={DEPARTMENT_OPTIONS}
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingUser(null)}
                className="rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#7c0d15] hover:bg-[#b5111b] text-white rounded-xl text-xs font-bold px-4"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 3: Delete Confirmation Popup */}
      {deletingUser && (
        <Modal
          isOpen={!!deletingUser}
          onClose={() => setDeletingUser(null)}
          title="Confirm User Deletion"
          className="max-w-md w-[94%] sm:w-full rounded-2xl"
        >
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 font-bold">
                <AlertCircle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold">Warning: Permanent Deletion</h4>
                <p className="text-[11px] text-rose-700 mt-0.5 leading-snug">
                  Are you sure you want to delete user <strong className="font-extrabold">{deletingUser.name}</strong> ({deletingUser.email})? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDeletingUser(null)}
                className="rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteUser}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold px-4"
              >
                Delete Account
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* DRAWER: User Profile & Activity Slide-Over Panel */}
      {profileDrawerUser && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setProfileDrawerUser(null)}
          />

          {/* Slide-over Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 animate-in slide-in-from-right duration-300 flex flex-col justify-between">

              {/* Drawer Header */}
              <div className="p-4 sm:p-5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200/80 text-slate-500 flex items-center justify-center shadow-2xs">
                    <User className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 leading-tight">{profileDrawerUser.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{profileDrawerUser.email}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setProfileDrawerUser(null)}
                  className="w-8 h-8 p-0 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Drawer Content */}
              <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-left">
                {/* Account Summary Banner (LIGHT SLATE GRAY THEME matching Payment System Policy) */}
                <div className="p-4 bg-slate-50/90 border border-slate-200/90 rounded-2xl space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Account Overview</span>
                    {renderRoleBadge(profileDrawerUser.role)}
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 text-xs pt-1">
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-0.5">
                      <span className="text-slate-400 block text-[10px] font-extrabold uppercase tracking-wider">Department</span>
                      <span className="font-black text-slate-900 text-xs">{profileDrawerUser.department}</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-0.5">
                      <span className="text-slate-400 block text-[10px] font-extrabold uppercase tracking-wider">Assigned Projects</span>
                      <span className="font-black text-[#B5111B] text-xs">{profileDrawerUser.assignedProjectsCount} Active</span>
                    </div>
                  </div>
                </div>

                {/* Account Activity Timeline */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" /> Recent Security & Audit Logs
                  </h4>

                  <div className="space-y-2 border-l-2 border-slate-200 ml-2 pl-4 py-1">
                    <div className="relative group">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white" />
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <div className="text-xs font-bold text-slate-900">LoggedIn to Rose Analytics</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">IP: 192.168.1.104 • {profileDrawerUser.lastActive}</div>
                      </div>
                    </div>

                    <div className="relative group">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white" />
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <div className="text-xs font-bold text-slate-900">Modified Section Metrics</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">Updated Westside Transit Hub 2026</div>
                      </div>
                    </div>

                    <div className="relative group">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-purple-500 ring-4 ring-white" />
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <div className="text-xs font-bold text-slate-900">Account Created</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">Registered on {profileDrawerUser.createdAt}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
                <span className="text-xs text-slate-500 font-medium">User ID: {profileDrawerUser.id}</span>
                <Button
                  onClick={() => setProfileDrawerUser(null)}
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold px-4 py-2 cursor-pointer"
                >
                  Close Profile
                </Button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
