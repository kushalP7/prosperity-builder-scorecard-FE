import React from "react"
import { Routes, Route, Navigate, useLocation } from "react-router-dom"
import { AppShell } from "@/components/layout/AppShell"
import { ToastContainer } from "@/components/ui/toast"
import { GlobalRoseLoader } from "@/components/ui/loader"

// Feature Under Development Placeholder
import { FeatureUnderDevelopmentPage } from "@/pages/common/FeatureUnderDevelopmentPage"

// Public Landing Pages
import LandingPage from "@/pages/landing/LandingPage"
import AboutPage from "@/pages/landing/AboutPage"
import CategoriesPage from "@/pages/landing/CategoriesPage"
import ExecutiveAnalyticsPage from "@/pages/landing/ExecutiveAnalyticsPage"
import FrameworkPage from "@/pages/landing/FrameworkPage"
import GlossaryPage from "@/pages/landing/GlossaryPage"
import PricingPage from "@/pages/landing/PricingPage"
import ProcessPage from "@/pages/landing/ProcessPage"
import ProjectPortfolioPage from "@/pages/landing/ProjectPortfolioPage"
import ProsperityBuilderScorecardPage from "@/pages/landing/ProsperityBuilderScorecardPage"
import ReportsPage from "@/pages/landing/ReportsPage"
import ReportDetailPage from "@/pages/landing/ReportDetailPage"
import VideosPage from "@/pages/landing/VideosPage"
import AllVideosPage from "@/pages/landing/AllVideosPage"

// Auth Pages
import LoginPage from "@/pages/auth/LoginPage"

// CMS Pages (Active Deliverable)
import LandingCMSPage from "@/pages/cms/LandingCMSPage"
import MediaCreatePage from "@/pages/cms/MediaCreatePage"
import MediaEditPage from "@/pages/cms/MediaEditPage"
import ReportCreatePage from "@/pages/cms/ReportCreatePage"
import ReportEditPage from "@/pages/cms/ReportEditPage"

// Module Pages (Under Development - uncomment to re-enable in future releases)
// import OverallAnalyticsPage from "@/pages/dashboard/OverallAnalyticsPage"
// import AnalyticsPage from "@/pages/dashboard/AnalyticsPage"
// import AnalyticsMakerPage from "@/pages/dashboard/AnalyticsMakerPage"
// import ProjectsPage from "@/pages/projects/ProjectsPage"
// import ProjectLayout from "@/pages/projects/ProjectLayout"
// import ProjectDataPage from "@/pages/projects/ProjectDataPage"
// import ProjectAnalyticsPage from "@/pages/projects/ProjectAnalyticsPage"
// import SectionMakerPage from "@/pages/section-maker/SectionMakerPage"
// import SectionMakerCategoryPage from "@/pages/section-maker/SectionMakerCategoryPage"
// import OrdersPage from "@/pages/orders/OrdersPage"
// import PaymentsPage from "@/pages/payments/PaymentsPage"
// import UsersPage from "@/pages/users/UsersPage"
// import SettingsPage from "@/pages/settings/SettingsPage"

function ScrollToTop() {
  const { pathname, hash } = useLocation()
  React.useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0)
    } else {
      const targetId = hash.replace("#", "")
      const el = document.getElementById(targetId)
      if (el) {
        el.scrollIntoView({ behavior: "smooth" })
      }
    }
  }, [pathname, hash])
  return null
}

export function App() {
  return (
    <>
      <GlobalRoseLoader />
      <ScrollToTop />
      <AppShell>
        <Routes>
          {/* Public Landing Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/executive-analytics" element={<ExecutiveAnalyticsPage />} />
          <Route path="/framework" element={<FrameworkPage />} />
          <Route path="/glossary" element={<GlossaryPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/process" element={<ProcessPage />} />
          <Route path="/project-portfolio" element={<ProjectPortfolioPage />} />
          <Route path="/projects-portfolio" element={<Navigate to="/project-portfolio" replace />} />
          <Route path="/prosperity-builder-scorecard" element={<ProsperityBuilderScorecardPage />} />
          <Route path="/report-showcase" element={<Navigate to="/prosperity-builder-scorecard" replace />} />
          <Route path="/services" element={<Navigate to="/#services" replace />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/report/:slug" element={<ReportDetailPage />} />
          <Route path="/videos" element={<VideosPage />} />
          <Route path="/videos/all" element={<AllVideosPage />} />

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />

          {/* Admin Dashboard */}
          <Route path="/overall-analytics" element={<FeatureUnderDevelopmentPage />} /> {/* Future: <OverallAnalyticsPage /> */}
          <Route path="/analytics" element={<FeatureUnderDevelopmentPage />} /> {/* Future: <AnalyticsPage /> */}
          <Route path="/analytics-maker" element={<FeatureUnderDevelopmentPage />} /> {/* Future: <AnalyticsMakerPage /> */}

          {/* Projects */}
          <Route path="/projects" element={<FeatureUnderDevelopmentPage />} /> {/* Future: <ProjectsPage /> */}
          <Route path="/projects/:id/*" element={<FeatureUnderDevelopmentPage />} /> {/* Future: <ProjectLayout /> */}

          {/* Section Maker */}
          <Route path="/section-maker" element={<FeatureUnderDevelopmentPage />} /> {/* Future: <SectionMakerPage /> */}
          <Route path="/section-maker/*" element={<FeatureUnderDevelopmentPage />} /> {/* Future: <SectionMakerCategoryPage /> */}

          {/* CMS (Active Deliverable) */}
          <Route path="/landing-cms" element={<LandingCMSPage />} />
          <Route path="/landing-cms/media/create" element={<MediaCreatePage />} />
          <Route path="/landing-cms/media/edit/:id" element={<MediaEditPage />} />
          <Route path="/landing-cms/reports/create" element={<ReportCreatePage />} />
          <Route path="/landing-cms/reports/edit/:id" element={<ReportEditPage />} />

          {/* Admin Management */}
          <Route path="/orders" element={<FeatureUnderDevelopmentPage />} /> {/* Future: <OrdersPage /> */}
          <Route path="/payments" element={<FeatureUnderDevelopmentPage />} /> {/* Future: <PaymentsPage /> */}
          <Route path="/users" element={<FeatureUnderDevelopmentPage />} /> {/* Future: <UsersPage /> */}
          <Route path="/settings" element={<FeatureUnderDevelopmentPage />} /> {/* Future: <SettingsPage /> */}

          {/* Fallback to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
      <ToastContainer />
    </>
  )
}

export default App
