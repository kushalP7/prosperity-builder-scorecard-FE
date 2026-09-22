"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const pathname = usePathname()

  const navItems = [
    { name: "Services", href: "/#services" },
    { name: "Report Showcase", href: "/#report-showcase" },
    { name: "Projects", href: "/project-portfolio" },
    { name: "Media Sphere", href: "/videos" },
    { name: "Categories", href: "/categories" },
    { name: "About Us", href: "/about" },
    { name: "Pricing Plans", href: "/pricing" },
  ]

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("/#")) {
      const targetId = href.replace("/#", "")
      if (pathname === "/") {
        e.preventDefault()
        const el = document.getElementById(targetId)
        if (el) {
          el.scrollIntoView({ behavior: "smooth" })
          window.history.pushState(null, "", href)
        }
      }
    }
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    if (href.startsWith("/#")) return false
    if (href === "/project-portfolio" && pathname.startsWith("/project-portfolio")) return true
    if (href === "/categories" && pathname.startsWith("/categories")) return true
    if (href === "/videos" && pathname.startsWith("/videos")) return true
    return pathname === href
  }

  return (
    <header className="sticky top-0 z-[1000] bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-2xs">
      <div className="h-0.5 bg-gradient-to-r from-[#5C090E] via-[#B5111B] to-[#E11D48]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <img
            src="/logo.png"
            alt="Rose Associates"
            draggable={false}
            className="h-9 sm:h-10 w-auto object-contain select-none pointer-events-none"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-bold text-slate-700">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className={`transition-colors whitespace-nowrap ${
                isActive(item.href)
                  ? "text-[#B5111B] font-extrabold"
                  : "hover:text-[#B5111B]"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <Link
            href="/login"
            className="text-sm font-bold text-slate-700 hover:text-[#B5111B] px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            Sign In
          </Link>
          <Link
            href="/login"
            className="bg-[#B5111B] hover:bg-[#8F0D15] text-white text-sm font-extrabold px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
          >
            Buy Subscription
          </Link>
        </div>

        {/* Mobile / Tablet Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile / Tablet Responsive Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-6 space-y-4 shadow-xl animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-3 text-sm font-bold text-slate-800">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  handleNavClick(e, item.href)
                  setMobileMenuOpen(false)
                }}
                className={`p-2.5 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? "bg-red-50 text-[#B5111B] font-extrabold"
                    : "hover:bg-red-50 hover:text-[#B5111B]"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
            <Link
              href="/login"
              className="w-full text-center py-2.5 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="w-full text-center py-3 text-sm font-extrabold text-white bg-[#B5111B] hover:bg-[#8F0D15] rounded-xl shadow-xs transition-colors"
            >
              Buy Subscription
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
