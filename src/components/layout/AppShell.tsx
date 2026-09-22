"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/store"
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  Layers, 
  PieChart, 
  Settings, 
  FolderOpen, 
  BarChart3, 
  ReceiptText, 
  Users, 
  DollarSign, 
  LogOut, 
  User,
  Menu,
  X
} from "lucide-react"

export function AppShell({ children }: { children: React.ReactNode }) {
  const { initialize, isAuthenticated, currentUser, logout } = useAppStore()
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = React.useState(false)
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  const PUBLIC_ROUTES = [
    "/",
    "/login",
    "/about",
    "/pricing",
    "/categories",
    "/services",
    "/videos",
    "/videos/all",
    "/report-showcase",
    "/reports",
    "/report",
    "/project-portfolio",
    "/projects-portfolio",
  ]
  const isPublicPage =
    PUBLIC_ROUTES.includes(pathname) ||
    pathname.startsWith("/videos") ||
    pathname.startsWith("/report/") ||
    pathname.startsWith("/project-portfolio") ||
    pathname.startsWith("/projects-portfolio")

  React.useEffect(() => {
    setMounted(true)
    if (!isPublicPage) {
      initialize()
    }
  }, [initialize, isPublicPage])

  React.useEffect(() => {
    if (mounted && !isAuthenticated && !isPublicPage) {
      router.push("/login")
    }
  }, [mounted, isAuthenticated, isPublicPage, router])

  // Automatically close mobile sidebar on route change
  React.useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  // If on public pages (/ or /login), render children standalone without admin sidebar/header
  if (isPublicPage) {
    return <>{children}</>
  }

  // Prevent flash of protected content before mounting auth check
  if (!mounted || (!isAuthenticated && !isPublicPage)) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#B5111B] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const navItems = [
    { href: "/overall-analytics", label: "Overall Dashboard", icon: BarChart3 },
    { href: "/analytics", label: "Dashboard", icon: LayoutDashboard },
    { href: "/projects", label: "Projects", icon: FolderOpen },
    { href: "/section-maker", label: "Section Maker", icon: Layers },
    { href: "/orders", label: "Orders", icon: ReceiptText },
    { href: "/payments", label: "Payments", icon: DollarSign },
    { href: "/users", label: "Users", icon: Users },
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/landing-cms", label: "Landing CMS", icon: FileSpreadsheet },

  ]

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      
      {/* MOBILE DRAWER BACKDROP */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden transition-opacity"
        />
      )}

      {/* SIDEBAR (DESKTOP FIXED + MOBILE SLIDE-OUT DRAWER) */}
      <aside 
        className={cn(
          "fixed md:static inset-y-0 left-0 z-50 w-64 bg-surface flex flex-col border-r border-slate-200/80 shadow-xl md:shadow-none transition-transform duration-300 ease-in-out shrink-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Sidebar Header with Brand Logo & Mobile Close Button */}
        <div className="p-4 h-16 flex items-center justify-between border-b border-slate-100 md:border-b-0">
          <Link href="/projects" className="flex items-center">
            <img src="/logo.png" alt="Rose Associates" className="max-h-11 w-auto object-contain" />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive 
                    ? "bg-[#B5111B] text-white shadow-xs font-bold" 
                    : "text-slate-700 hover:bg-[#B5111B]/10 hover:text-[#B5111B]"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Profile & Logout Bottom Card */}
        {currentUser && (
          <div className="p-3.5 border-t border-slate-200/80 bg-slate-50/80 mt-auto shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#B5111B]/10 text-[#B5111B] flex items-center justify-center font-bold text-xs border border-[#B5111B]/20 shrink-0 shadow-2xs">
                  {currentUser.name ? currentUser.name.charAt(0) : "A"}
                </div>
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-xs font-bold text-slate-900 truncate leading-tight">{currentUser.name}</span>
                  <span className="text-[10px] text-slate-500 truncate font-medium">{currentUser.email}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title="Log Out"
                className="p-1.5 rounded-xl text-slate-500 hover:text-[#B5111B] hover:bg-red-50 border border-slate-200/80 hover:border-red-200 transition-all cursor-pointer shrink-0 flex items-center gap-1 text-xs font-bold"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header Bar with Mobile Hamburger Button */}
        <header className="min-h-[64px] py-2 bg-surface flex items-center justify-between px-4 sm:px-6 shrink-0 border-b border-slate-200/80">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
              aria-label="Open sidebar navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div id="app-header-title" className="flex flex-col justify-center">
              {pathname !== '/section-maker' && !pathname.startsWith('/projects') && pathname !== '/analytics-maker' && (
                <h1 className="text-lg sm:text-xl font-bold text-foreground">
                  {navItems.find(i => i.href === pathname || (i.href !== "/" && pathname.startsWith(i.href)))?.label || "Overview"}
                </h1>
              )}
            </div>
          </div>

          <div id="app-header-actions" className="flex items-center gap-3"></div>
        </header>

        {/* Scrollable Page Body */}
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
