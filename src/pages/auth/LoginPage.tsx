"use client"

import * as React from "react"
import { Link, useRouter } from "@/lib/router-compat"
import { useAppStore } from "@/store"
import {
  Eye,
  EyeOff,
  Loader2,
  Building2,
  ShieldCheck,
  Quote,
  ArrowLeft,
  UserPlus,
  LogIn,
  Lock,
  Mail,
  User as UserIcon,
  CheckCircle2,
  HelpCircle,
  X,
  MapPin,
  TrendingUp,
  Activity,
  BadgeCheck,
  FileCheck
} from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { login, register, isAuthenticated } = useAppStore()

  const [authMode, setAuthMode] = React.useState<'login' | 'register'>('login')

  // Clean production state - no prefilled passwords or credentials
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [rememberMe, setRememberMe] = React.useState(true)

  // Registration form state
  const [regName, setRegName] = React.useState("")
  const [regEmail, setRegEmail] = React.useState("")
  const [regPassword, setRegPassword] = React.useState("")
  const [regDepartment, setRegDepartment] = React.useState("")

  const [errorMsg, setErrorMsg] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [showForgotModal, setShowForgotModal] = React.useState(false)

  React.useEffect(() => {
    if (isAuthenticated) {
      router.push("/landing-cms")
    }
  }, [isAuthenticated, router])

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")

    if (!email.trim() || !password) {
      setErrorMsg("Please enter both your email and password.")
      return
    }

    setIsSubmitting(true)

    try {
      const success = await login(email.trim(), password)
      if (success) {
        router.push("/landing-cms")
      } else {
        setErrorMsg("Invalid email or password. Please verify your credentials.")
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred during sign in. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")

    if (!regName.trim()) {
      setErrorMsg("Please provide your full name.")
      return
    }
    if (!regEmail.trim()) {
      setErrorMsg("Please provide a valid email address.")
      return
    }
    if (regPassword.length < 6) {
      setErrorMsg("Password must contain at least 6 characters.")
      return
    }

    setIsSubmitting(true)

    try {
      const success = await register({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        department: regDepartment.trim() || "Planning & Assessment",
      })

      if (success) {
        router.push("/landing-cms")
      } else {
        setErrorMsg("Registration failed. Please check the information provided.")
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred during registration.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-50 font-sans selection:bg-rose-100 selection:text-rose-900">
      
      {/* Left Column: Unique Visual Brand & Product Showcase Panel */}
      <div className="hidden md:flex md:w-1/2 lg:w-5/12 text-white flex-col justify-between p-8 lg:p-12 relative overflow-hidden bg-gradient-to-br from-[#090204] via-[#110306] to-[#1a0508] border-r border-rose-950/40 shadow-2xl">
        
        {/* Modern Blueprint / Planning Coordinate Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_35%,#000_60%,transparent_100%)] pointer-events-none" />
        
        {/* Layered Rose Red Atmospheric Glows */}
        <div className="absolute -top-36 -left-36 w-96 h-96 bg-rose-600/20 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-80 h-80 bg-red-700/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 left-1/4 w-80 h-80 bg-rose-950/40 rounded-full blur-[90px] pointer-events-none" />

        {/* Top & Middle Content Container */}
        <div className="relative z-10 space-y-6">
          
          {/* Logo Badge & Back Link */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl w-fit shadow-xl border border-white/20 hover:scale-105 transition-all block cursor-pointer group"
              title="Return to Home"
            >
              <img src="/branding/logo.png" alt="Rose Associates" className="h-8 w-auto object-contain" />
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] px-3.5 py-2 rounded-xl border border-white/10 transition-all cursor-pointer backdrop-blur-md shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Website</span>
            </Link>
          </div>

          {/* Hero Titles & Headline */}
          <div className="space-y-2.5 pt-2">
            <h1 className="text-3xl lg:text-[2.5rem] font-black text-white tracking-tight leading-[1.15]">
              Prosperity Builder <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-white to-rose-300">Scorecard</span><sup className="text-base font-semibold text-rose-300 ml-1">®</sup>
            </h1>
            
            <p className="text-xs lg:text-sm text-slate-300/90 leading-relaxed font-normal max-w-md">
              The proprietary analytics engine for assessing municipal master plans, capital investment readiness, and regional prosperity indices.
            </p>
          </div>

          {/* UNIQUE PRODUCT SHOWCASE WIDGET (Live Municipal Scorecard Card) */}
          <div className="relative rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/15 p-4 sm:p-5 shadow-2xl space-y-3.5 hover:border-white/25 transition-all">
            
            {/* Top Badge Row */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-600 to-[#8F0D15] flex items-center justify-center text-white font-black text-xs shadow-md border border-rose-400/30">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white tracking-wide">
                    Davidson Town Center Master Plan
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                    <span>Mecklenburg County, NC • 2026 Evaluation</span>
                  </div>
                </div>
              </div>
              
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-extrabold tracking-wide uppercase">
                <BadgeCheck className="w-3.5 h-3.5" />
                <span>Calibrated</span>
              </span>
            </div>

            {/* Scorecard Metric Breakdown */}
            <div className="grid grid-cols-3 gap-3 items-center bg-black/40 rounded-xl p-3 border border-white/5">
              <div className="col-span-1 text-center border-r border-white/10 pr-2 space-y-0.5">
                <div className="text-2xl lg:text-3xl font-black text-white tracking-tight leading-none">
                  8.7<span className="text-xs font-normal text-slate-400">/10</span>
                </div>
                <div className="text-[9px] uppercase tracking-wider font-extrabold text-emerald-400 flex items-center justify-center gap-1 pt-0.5">
                  <TrendingUp className="w-2.5 h-2.5" />
                  <span>Excellent</span>
                </div>
              </div>
              
              <div className="col-span-2 space-y-2 pl-1.5">
                <div>
                  <div className="flex justify-between text-[10px] text-slate-300 font-medium mb-1">
                    <span>Economic Vitality & Jobs</span>
                    <span className="text-white font-bold font-mono">92%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-rose-500 to-emerald-400 rounded-full w-[92%]" />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-[10px] text-slate-300 font-medium mb-1">
                    <span>Land Use & Infrastructure</span>
                    <span className="text-white font-bold font-mono">84%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-rose-500 to-amber-400 rounded-full w-[84%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Footer Inside Card */}
            <div className="flex items-center justify-between text-[10px] text-slate-300/80 pt-0.5">
              <span className="flex items-center gap-1.5 font-medium">
                <FileCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Deterministic Category Weighting</span>
              </span>
              <span className="font-mono text-slate-400 text-[10px] bg-white/[0.06] px-2 py-0.5 rounded-md border border-white/10">
                Audit: Verified
              </span>
            </div>

          </div>

          {/* Key Proof Metrics Row */}
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div className="p-3 bg-white/[0.04] backdrop-blur-md rounded-xl border border-white/10 text-center space-y-0.5">
              <div className="text-base lg:text-lg font-black text-white">140+</div>
              <div className="text-[10px] text-slate-300 font-medium leading-tight">Master Plans</div>
            </div>
            <div className="p-3 bg-white/[0.04] backdrop-blur-md rounded-xl border border-white/10 text-center space-y-0.5">
              <div className="text-base lg:text-lg font-black text-rose-400">100%</div>
              <div className="text-[10px] text-slate-300 font-medium leading-tight">Deterministic</div>
            </div>
            <div className="p-3 bg-white/[0.04] backdrop-blur-md rounded-xl border border-white/10 text-center space-y-0.5">
              <div className="text-base lg:text-lg font-black text-white">Certified</div>
              <div className="text-[10px] text-slate-300 font-medium leading-tight">PDF Dossiers</div>
            </div>
          </div>

          {/* Kathleen Rose Leadership Endorsement */}
          <div className="p-3.5 bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/10 space-y-1.5 relative shadow-sm">
            <Quote className="w-4 h-4 text-rose-400/40 absolute top-3 right-3" />
            <p className="text-[11px] text-slate-200 leading-relaxed italic pr-5 font-normal">
              &ldquo;The Prosperity Builder Scorecard provides leadership with an objective, data-backed assessment that accelerates master plan approvals.&rdquo;
            </p>
            <div className="flex items-center justify-between pt-1 border-t border-white/10">
              <div className="text-[10px] font-bold text-rose-300">
                Kathleen Rose, CCIM, CRE
              </div>
              <div className="text-[9px] text-slate-400 font-medium">
                President & CEO, Rose Associates
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-slate-400 border-t border-white/10 pt-4 mt-4 flex items-center justify-between">
          <span className="text-slate-400 font-mono text-[11px]">
            &copy; {new Date().getFullYear()} Rose Associates
          </span>
          <span className="text-slate-500 font-mono text-[10px]">
            Enterprise Platform
          </span>
        </div>

      </div>

      {/* Right Column: Clean Enterprise Sign In / Register Form */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-16 bg-white md:bg-slate-50/60 overflow-y-auto">
        
        {/* Mobile Header */}
        <div className="md:hidden pb-6 flex items-center justify-between border-b border-slate-200/80 mb-4">
          <Link href="/">
            <img src="/branding/logo.png" alt="Rose Associates" className="h-8 w-auto object-contain" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#B5111B] bg-slate-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Website</span>
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto my-auto space-y-6">
          
          {/* Header & Mode Switcher */}
          <div className="space-y-4">
            
            {/* Mode Switcher */}
            <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/80 shadow-xs">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setErrorMsg(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('register'); setErrorMsg(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </button>
            </div>

            {/* Title & Description */}
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {authMode === 'login' ? 'Sign in to your portal' : 'Create an assessment account'}
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                {authMode === 'login'
                  ? 'Access your municipal scorecard projects, real-time analytics, and client deliverables.'
                  : 'Enter your details below to register for portal access. Standard permissions apply.'}
              </p>
            </div>
          </div>

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium rounded-xl flex items-start gap-2.5 animate-in fade-in duration-200">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0 mt-1.5" />
              <div className="flex-1 leading-snug">{errorMsg}</div>
            </div>
          )}

          {/* SIGN IN FORM */}
          {authMode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              {/* Email Address */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-bold text-slate-700 block">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@agency.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-[#B5111B] transition-all shadow-xs"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-bold text-slate-700 block">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs text-[#B5111B] hover:text-[#8F0D15] font-semibold transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-[#B5111B] transition-all shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded-md border-slate-300 text-[#B5111B] focus:ring-[#B5111B] h-4 w-4 cursor-pointer"
                  />
                  <span>Keep me signed in on this device</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#B5111B] hover:bg-[#8F0D15] text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-rose-950/10 hover:shadow-lg cursor-pointer transition-all duration-150 text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In to Portal</span>
                )}
              </button>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label htmlFor="reg-name" className="text-xs font-bold text-slate-700 block">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Kathleen Vance"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-[#B5111B] transition-all shadow-xs"
                  />
                </div>
              </div>

              {/* Work Email Address */}
              <div className="space-y-1.5">
                <label htmlFor="reg-email" className="text-xs font-bold text-slate-700 block">
                  Work Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@agency.gov"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-[#B5111B] transition-all shadow-xs"
                  />
                </div>
              </div>

              {/* Department / Organization */}
              <div className="space-y-1.5">
                <label htmlFor="reg-dept" className="text-xs font-bold text-slate-700 block">
                  Department / Municipal Agency
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-dept"
                    type="text"
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    placeholder="e.g. Planning & Economic Development"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-[#B5111B] transition-all shadow-xs"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="reg-password" className="text-xs font-bold text-slate-700 block">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-[#B5111B] transition-all shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Permissions Notice */}
              <div className="p-3 bg-slate-100 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Organization Account</span>
                </div>
                <div>New accounts receive secure portal access. Super Admins may adjust scope & privileges upon review.</div>
              </div>

              {/* Register Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#B5111B] hover:bg-[#8F0D15] text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-rose-950/10 hover:shadow-lg cursor-pointer transition-all duration-150 text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>
          )}

        </div>

        {/* Footer Support Info */}
        <div className="text-center text-xs text-slate-500 pt-6">
          Need help accessing your account? Contact{" "}
          <a
            href="mailto:support@roseassociates.com"
            className="text-slate-800 font-semibold hover:text-[#B5111B] transition-colors underline underline-offset-2"
          >
            Rose Associates Support
          </a>
        </div>
      </div>

      {/* Forgot Password Helper Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 relative">
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#B5111B]">
              <HelpCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">Credential Recovery</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                For security reasons, password resets are governed by your organizational administrator.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
              <div className="font-semibold text-slate-900">Contact Administrator:</div>
              <div className="font-mono text-slate-600 text-[11px]">admin@roseassociates.com</div>
            </div>

            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
