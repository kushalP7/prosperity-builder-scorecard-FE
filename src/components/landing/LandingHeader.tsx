"use client"

import * as React from "react"
import { Link, usePathname } from "@/lib/router-compat"
import { Menu, X, ChevronDown, Award, Layers, DollarSign, Building2 } from "lucide-react"

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [scorecardDropdownOpen, setScorecardDropdownOpen] = React.useState(false)
  const [mobileScorecardOpen, setMobileScorecardOpen] = React.useState(false)
  const [contactDropdownOpen, setContactDropdownOpen] = React.useState(false)
  const [mobileContactOpen, setMobileContactOpen] = React.useState(false)
  const pathname = usePathname()

  const scorecardSubItems = [
    {
      name: "Scorecard Overview",
      description: "Comprehensive municipal dossier framework",
      href: "/prosperity-builder-scorecard",
      icon: Award,
    },
    {
      name: "Categories",
      description: "12 core community performance modules",
      href: "/categories",
      icon: Layers,
    },
    {
      name: "Pricing Plans",
      description: "Single reports & annual subscription tiers",
      href: "/pricing",
      icon: DollarSign,
    },
    // {
    //   name: "Inquire for Pricing Plans",
    //   description: "Make an inquiry for pricing plans",
    //   href: "/contact",
    //   icon: DollarSign,
    // }, //KP
  ];

  const contactSubItems = [
    {
      name: "Enterprise Contact",
      description: "Custom municipal proposal & sales inquiry",
      href: "/contact",
      icon: Building2,
    },
  ]

  const navItems = [
    { name: "Services", href: "/#services" },
    {
      name: "Prosperity Builder Scorecard®",
      href: "/prosperity-builder-scorecard",
      isDropdown: true,
      dropdownKey: "scorecard" as const,
    },
    { name: "Executive Analytics", href: "/executive-analytics" },
    { name: "Projects", href: "/project-portfolio" },
    { name: "Media Sphere", href: "/videos" },
    { name: "About Us", href: "/about" },
    // {
    //   name: "Contact Us",
    //   href: "/contact",
    //   isDropdown: true,
    //   dropdownKey: "contact" as const,
    // }, //KP
  ]

  const isScorecardActive =
    pathname === "/prosperity-builder-scorecard" ||
    pathname.startsWith("/categories") ||
    pathname.startsWith("/pricing")

  const isContactActive =
    pathname === "/contact" ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/enterprise-contact")

  // Auto-expand mobile accordions if currently on one of their pages
  React.useEffect(() => {
    if (isScorecardActive) {
      setMobileScorecardOpen(true)
    }
  }, [isScorecardActive])

  React.useEffect(() => {
    if (isContactActive) {
      setMobileContactOpen(true)
    }
  }, [isContactActive])

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
    if (href === "/prosperity-builder-scorecard") return isScorecardActive
    if (href === "/executive-analytics" && pathname.startsWith("/executive-analytics")) return true
    if (href === "/project-portfolio" && pathname.startsWith("/project-portfolio")) return true
    if (href === "/videos" && pathname.startsWith("/videos")) return true
    if (href === "/about" && pathname.startsWith("/about")) return true
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
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-sm font-bold text-slate-700">
          {navItems.map((item) => {
            if (item.isDropdown) {
              const isScorecard = item.dropdownKey === "scorecard";
              const isItemActive = isScorecard ? isScorecardActive : isContactActive;
              const isDropdownOpen = isScorecard ? scorecardDropdownOpen : contactDropdownOpen;
              const setDropdownOpen = isScorecard ? setScorecardDropdownOpen : setContactDropdownOpen;
              const subItems = isScorecard ? scorecardSubItems : contactSubItems;
              const flyoutTitle = isScorecard ? "Scorecard Navigation" : "Contact Options";

              return (
                <div
                  key={item.name}
                  className="relative group py-2"
                  onMouseEnter={() => setDropdownOpen(true)}
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <Link
                    href={item.href}
                    onClick={() => setDropdownOpen(false)}
                    className={`transition-colors whitespace-nowrap flex items-center gap-1.5 py-1 ${isItemActive
                      ? "text-[#B5111B] font-extrabold"
                      : "hover:text-[#B5111B]"
                      }`}
                  >
                    <span>{item.name}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${isDropdownOpen
                        ? "rotate-180 text-[#B5111B]"
                        : "text-slate-400 group-hover:text-[#B5111B]"
                        }`}
                    />
                  </Link>

                  {/* Desktop Dropdown Flyout */}
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 pt-1.5 w-72 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 p-2 space-y-1 ring-1 ring-black/5">
                        <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          {flyoutTitle}
                        </div>
                        {subItems.map((sub) => {
                          const isSubActive = pathname === sub.href;
                          const IconComponent = sub.icon;
                          return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={() => setDropdownOpen(false)}
                              className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${isSubActive
                                ? "bg-red-50 text-[#B5111B]"
                                : "hover:bg-slate-50 text-slate-800 hover:text-[#B5111B]"
                                }`}
                            >
                              <div
                                className={`p-2 rounded-lg shrink-0 mt-0.5 transition-colors ${isSubActive
                                  ? "bg-[#B5111B] text-white"
                                  : "bg-slate-100 text-slate-600 group-hover:text-[#B5111B]"
                                  }`}
                              >
                                <IconComponent className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold leading-tight">
                                  {sub.name}
                                </div>
                                <div className="text-[11px] text-slate-500 font-normal leading-tight mt-0.5 truncate">
                                  {sub.description}
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={`transition-colors whitespace-nowrap ${isActive(item.href)
                  ? "text-[#B5111B] font-extrabold"
                  : "hover:text-[#B5111B]"
                  }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <Link
            href="/login"
            className="bg-[#B5111B] hover:bg-[#8F0D15] text-white text-sm font-extrabold px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
          >
            Client Portal
          </Link>
        </div>

        {/* Mobile / Tablet Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile / Tablet Responsive Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-6 space-y-4 shadow-xl animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-2 text-sm font-bold text-slate-800">
            {/* Services */}
            <Link
              href="/#services"
              onClick={(e) => {
                handleNavClick(e, "/#services");
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-lg hover:bg-red-50 hover:text-[#B5111B] transition-colors"
            >
              Services
            </Link>

            {/* Prosperity Builder Scorecard® with expandable subcategories */}
            <div className="space-y-1">
              <div className="flex items-center justify-between rounded-lg p-2.5 hover:bg-red-50 transition-colors">
                <Link
                  href="/prosperity-builder-scorecard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex-1 transition-colors ${isScorecardActive
                    ? "text-[#B5111B] font-extrabold"
                    : "text-slate-800 hover:text-[#B5111B]"
                    }`}
                >
                  Prosperity Builder Scorecard®
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileScorecardOpen(!mobileScorecardOpen)}
                  className="p-1 text-slate-500 hover:text-[#B5111B]"
                  aria-label="Toggle scorecard subcategories"
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${mobileScorecardOpen ? "rotate-180 text-[#B5111B]" : ""
                      }`}
                  />
                </button>
              </div>

              {mobileScorecardOpen && (
                <div className="pl-4 space-y-1 border-l-2 border-red-200 ml-3 py-1">
                  {scorecardSubItems.map((sub) => {
                    const isSubActive = pathname === sub.href;
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-3 py-2 text-xs font-bold rounded-lg transition-colors ${isSubActive
                          ? "bg-red-50 text-[#B5111B] font-black"
                          : "text-slate-600 hover:bg-red-50 hover:text-[#B5111B]"
                          }`}
                      >
                        {sub.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Executive Analytics */}
            <Link
              href="/executive-analytics"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2.5 rounded-lg transition-colors ${pathname === "/executive-analytics"
                ? "bg-red-50 text-[#B5111B] font-extrabold"
                : "hover:bg-red-50 hover:text-[#B5111B]"
                }`}
            >
              Executive Analytics
            </Link>
            {/* need to uncomment */}
            {/* Projects */}
            <Link
              href="/project-portfolio"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2.5 rounded-lg transition-colors ${pathname.startsWith("/project-portfolio")
                ? "bg-red-50 text-[#B5111B] font-extrabold"
                : "hover:bg-red-50 hover:text-[#B5111B]"
                }`}
            >
              Projects
            </Link>

            {/* Media Sphere */}
            <Link
              href="/videos"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2.5 rounded-lg transition-colors ${pathname.startsWith("/videos")
                ? "bg-red-50 text-[#B5111B] font-extrabold"
                : "hover:bg-red-50 hover:text-[#B5111B]"
                }`}
            >
              Media Sphere
            </Link>

            {/* About Us */}
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2.5 rounded-lg transition-colors ${pathname === "/about"
                ? "bg-red-50 text-[#B5111B] font-extrabold"
                : "hover:bg-red-50 hover:text-[#B5111B]"
                }`}
            >
              About Us
            </Link>

            {/* Contact Us with expandable Enterprise Contact */}
            <div className="space-y-1">
              <div className="flex items-center justify-between rounded-lg p-2.5 hover:bg-red-50 transition-colors">
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex-1 transition-colors ${isContactActive
                    ? "text-[#B5111B] font-extrabold"
                    : "text-slate-800 hover:text-[#B5111B]"
                    }`}
                >
                  Contact Us
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileContactOpen(!mobileContactOpen)}
                  className="p-1 text-slate-500 hover:text-[#B5111B]"
                  aria-label="Toggle contact subcategories"
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${mobileContactOpen ? "rotate-180 text-[#B5111B]" : ""
                      }`}
                  />
                </button>
              </div>

              {mobileContactOpen && (
                <div className="pl-4 space-y-1 border-l-2 border-red-200 ml-3 py-1">
                  {contactSubItems.map((sub) => {
                    const isSubActive = pathname === sub.href;
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-3 py-2 text-xs font-bold rounded-lg transition-colors ${isSubActive
                          ? "bg-red-50 text-[#B5111B] font-black"
                          : "text-slate-600 hover:bg-red-50 hover:text-[#B5111B]"
                          }`}
                      >
                        {sub.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 text-sm font-extrabold text-white bg-[#B5111B] hover:bg-[#8F0D15] rounded-xl shadow-xs transition-colors"
            >
              Client Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
