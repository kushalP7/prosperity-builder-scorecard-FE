import * as React from "react"
import { Link } from "@/lib/router-compat"
import { Clock, ArrowRight, FileSpreadsheet } from "lucide-react"

interface FeatureUnderDevelopmentPageProps {
  title?: string
  module?: string
}

export function FeatureUnderDevelopmentPage({ title }: FeatureUnderDevelopmentPageProps) {
  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8 text-center space-y-6">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#B5111B] mx-auto">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-[#B5111B] border border-rose-200/60">
            Coming Soon
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {title || "Feature Under Development"}
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            This module is currently under active development and will be available in an upcoming release.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Link
            href="/landing-cms"
            className="inline-flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-xl bg-[#B5111B] hover:bg-[#8F0D15] text-white font-medium text-sm transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Go to Landing CMS</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default FeatureUnderDevelopmentPage
