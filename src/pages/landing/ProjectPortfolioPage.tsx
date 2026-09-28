"use client"

import * as React from "react"
import { ArrowUp } from "lucide-react"
import { projectsApi, LandingProjectItem } from "@/lib/projects-api"
import ProjectPortfolioMap from "@/components/landing/ProjectPortfolioMap"
import ProjectPortfolioSidebar from "@/components/landing/ProjectPortfolioSidebar"
import { LandingHeader } from "@/components/landing/LandingHeader"
import { LandingFooter } from "@/components/landing/LandingFooter"

export default function ProjectPortfolioPage() {
  const [projects, setProjects] = React.useState<LandingProjectItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [focusedProject, setFocusedProject] = React.useState<LandingProjectItem | null>(null)
  const [selectedCategory, setSelectedCategory] = React.useState<string>("Corridor/Transportation Studies")
  const [mounted, setMounted] = React.useState(false)
  const [showScrollTop, setShowScrollTop] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true)
      } else {
        setShowScrollTop(false)
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  React.useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await projectsApi.getProjects({ status: "published" })
        setProjects(data)
      } catch (err) {
        console.error("Failed to load portfolio projects:", err)
      } finally {
        setLoading(false)
      }
    }
    loadProjects()
  }, [])

  const displayedProjects = React.useMemo(() => {
    if (selectedCategory === "all") return projects
    return projects.filter((p) => p.category === selectedCategory)
  }, [projects, selectedCategory])

  const handleSelectCommunity = (communityName: string) => {
    const cleanComm = communityName.split(",")[0].trim().toLowerCase()
    const found = projects.find((p) => p.title.toLowerCase().includes(cleanComm))
    if (found) {
      setFocusedProject(found)
    }
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      const mapEl = document.getElementById("portfolio-map-section")
      if (mapEl) {
        mapEl.scrollIntoView({ behavior: "smooth" })
      }
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#B5111B] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Global Landing Navbar */}
      <LandingHeader />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="bg-white border-b border-slate-200 py-10 sm:py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 sm:space-y-5">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              Featured <span className="text-[#B5111B]">Projects</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-4xl mx-auto">
              Our work includes hundreds of projects over the span of 30 years in dozens of communities throughout the Southeast. Below please find examples of project assignments, separated by project category. Please contact us for more information or a conversation.
            </p>
          </div>
        </section>

        {/* Main Content: Sidebar (Left) + Map (Right) Split Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div
            id="portfolio-map-section"
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Left Column: Browse By Project Type Sidebar (5 cols) */}
            <div className="lg:col-span-5">
              <ProjectPortfolioSidebar
                selectedCategory={selectedCategory}
                onSelectCategory={(cat) => setSelectedCategory(cat)}
                onSelectCommunity={handleSelectCommunity}
                projects={projects}
              />
            </div>

            {/* Right Column: Interactive Map (7 cols, sticky on desktop) */}
            <div className="lg:col-span-7 lg:sticky lg:top-24">
              <ProjectPortfolioMap
                projects={displayedProjects}
                focusedProject={focusedProject}
                onMarkerClick={(p) => setFocusedProject(p)}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Global Landing Footer */}
      <LandingFooter />

      {/* Back to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-[900] p-3.5 rounded-full bg-[#B5111B] text-white shadow-xl hover:bg-[#8F0D15] hover:scale-110 active:scale-95 transition-all cursor-pointer border border-white/20 group"
          title="Back to Top"
          aria-label="Back to Top"
        >
          <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      )}
    </div>
  )
}
