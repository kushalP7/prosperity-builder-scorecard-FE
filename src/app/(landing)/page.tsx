"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAppStore } from "@/store"
import { ArrowUp } from "lucide-react"

import { LandingHeader } from "@/components/landing/LandingHeader"
import { HeroSection } from "@/components/landing/HeroSection"
import { PartnersSection } from "@/components/landing/PartnersSection"
import { ReportShowcaseDetailedSection } from "@/components/landing/ReportShowcaseDetailedSection"
import { AnalyticsShowcaseSection } from "@/components/landing/AnalyticsShowcaseSection"
import { AdvisoryServicesSection } from "@/components/landing/AdvisoryServicesSection"
import { LandingFooter } from "@/components/landing/LandingFooter"

export default function LandingPage() {
  const router = useRouter()
  const { isAuthenticated } = useAppStore()
  const [mounted, setMounted] = React.useState(false)
  const [showScrollTop, setShowScrollTop] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (mounted && isAuthenticated) {
      router.push("/projects")
    }
  }, [mounted, isAuthenticated, router])

  React.useEffect(() => {
    if (mounted) {
      const hash = window.location.hash
      if (hash) {
        const id = hash.replace("#", "")
        const timer = setTimeout(() => {
          const el = document.getElementById(id)
          if (el) {
            el.scrollIntoView({ behavior: "smooth" })
          }
        }, 150)
        return () => clearTimeout(timer)
      }
    }
  }, [mounted])

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

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#B5111B] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <LandingHeader />
      <main className="flex-1">
        <HeroSection />
        <PartnersSection />
        <ReportShowcaseDetailedSection />
        <AnalyticsShowcaseSection />
        <AdvisoryServicesSection />
      </main>
      <LandingFooter />

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-3.5 rounded-full bg-[#B5111B] text-white shadow-xl hover:bg-[#8F0D15] hover:scale-110 active:scale-95 transition-all cursor-pointer border border-white/20 group"
          title="Back to Top"
          aria-label="Back to Top"
        >
          <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      )}
    </div>
  )
}
