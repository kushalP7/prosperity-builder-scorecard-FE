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
  Shield,
  Briefcase,
  BarChart2,
  Eye as EyeIcon,
  CheckCircle2,
  Lock
} from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { login, register, isAuthenticated } = useAppStore()

  const [authMode, setAuthMode] = React.useState<'login' | 'register'>('login')

  // Login form state
  const [email, setEmail] = React.useState("admin@roseassociates.com")
  const [password, setPassword] = React.useState("admin123")
  const [showPassword, setShowPassword] = React.useState(false)

  // Registration form state
  const [regName, setRegName] = React.useState("")
  const [regEmail, setRegEmail] = React.useState("")
  const [regPassword, setRegPassword] = React.useState("")
  const [regDepartment, setRegDepartment] = React.useState("Urban Planning")

  const [errorMsg, setErrorMsg] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (isAuthenticated) {
      router.push("/projects")
    }
  }, [isAuthenticated, router])

  const demoAccounts = [
    {
      role: 'Super Admin',
      name: 'Alexander Rose',
      email: 'admin@roseassociates.com',
      pass: 'admin123',
      color: 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100',
      icon: Shield,
      badge: 'Full Authority',
      desc: 'System config, user security, global templates, billing',
    },
    {
      role: 'Project Lead',
      name: 'Samantha Vance',
      email: 'svance@roseassociates.com',
      pass: 'manager123',
      color: 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100',
      icon: Briefcase,
      badge: 'Project Lifecycle',
      desc: 'Project management & report approvals',
    },
    {
      role: 'Assessment Specialist',
      name: 'Marcus Chen',
      email: 'mchen@roseassociates.com',
      pass: 'analyst123',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
      icon: BarChart2,
      badge: 'Data & Metrics',
      desc: 'Scorecard data entry & evaluation',
    },
    {
      role: 'Client Representative',
      name: 'Elena Rodriguez',
      email: 'erodriguez@roseassociates.com',
      pass: 'viewer123',
      color: 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200',
      icon: EyeIcon,
      badge: 'Read-Only Portal',
      desc: 'View projects & published reports',
    },
  ]

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail)
    setPassword(demoPass)
    setErrorMsg("")
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")
    setIsSubmitting(true)

    try {
      const success = await login(email, password)
      if (success) {
        router.push("/landing-cms")
      } else {
        setErrorMsg("Invalid email or password. Please verify your credentials.")
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An error occurred during sign in.")
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
    if (regPassword.length < 6) {
      setErrorMsg("Password must contain at least 6 characters.")
      return
    }

    setIsSubmitting(true)

    try {
      const success = await register({
        name: regName,
        email: regEmail,
        password: regPassword,
        department: regDepartment,
      })

      if (success) {
        router.push("/landing-cms")
      } else {
        setErrorMsg("Registration failed. Please check the information provided.")
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An error occurred during registration.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-50 font-sans">
      {/* Left Column: Visual Brand Showcase Panel */}
      <div className="hidden md:flex md:w-1/2 lg:w-5/12 text-white flex-col justify-between p-8 lg:p-12 relative overflow-hidden bg-slate-950 border-r border-slate-800">
        {/* Content Container */}
        <div className="relative z-10 space-y-8">
          {/* Logo Badge */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="bg-white/95 backdrop-blur-md p-3 rounded-2xl w-fit shadow-2xl border border-white/30 hover:scale-105 transition-all block cursor-pointer"
              title="Return to Home"
            >
              <img src="/logo.png" alt="Rose Associates" className="h-9 w-auto object-contain" />
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 px-3.5 py-2 rounded-xl border border-white/10 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Hero Titles & Headline */}
          <div className="space-y-3 pt-2">
            <div className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-rose-300 bg-red-950/80 px-3 py-1 rounded-full border border-red-800/60 shadow-xs">
              <Building2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Community Assessment Tool</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Prosperity Builder Scorecard
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-lg">
              Empowering municipal & regional planning boards through automated score calculations, section audits, and certified master plan analytics.
            </p>
          </div>

          {/* Live Platform Metrics Grid */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 space-y-0.5">
              <div className="text-lg font-black text-white">140+</div>
              <div className="text-[10px] text-slate-300 font-medium">Master Plans</div>
            </div>
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 space-y-0.5">
              <div className="text-lg font-black text-rose-400">99.2%</div>
              <div className="text-[10px] text-slate-300 font-medium">Score Precision</div>
            </div>
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 space-y-0.5">
              <div className="text-lg font-black text-white">Instant</div>
              <div className="text-[10px] text-slate-300 font-medium">PDF Reports</div>
            </div>
          </div>

          {/* Customer Quote / Testimonial Box */}
          <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 space-y-2 relative">
            <Quote className="w-5 h-5 text-rose-400/60 absolute top-3 right-3" />
            <p className="text-xs text-slate-200 leading-relaxed italic pr-6">
              &ldquo;Prosperity Builder has completely transformed how our team evaluates scorecards and delivers verified regional impact reports.&rdquo;
            </p>
            <div className="text-[11px] font-bold text-rose-300 pt-1">
              — Regional Planning Council Director
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-slate-400 border-t border-white/10 pt-5 mt-6 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>&copy; {new Date().getFullYear()} Rose Associates</span>
          </span>
          <span className="text-slate-500 font-mono">v2.4.0</span>
        </div>
      </div>

      {/* Right Column: Clean Enterprise Sign In Form */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-16 bg-white md:bg-slate-50/50 overflow-y-auto">
        <div className="md:hidden pb-6 flex items-center justify-between">
          <Link href="/">
            <img src="/logo.png" alt="Rose Associates" className="h-8 w-auto object-contain" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#B5111B] bg-slate-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto my-auto space-y-6">
          {/* Header & Mode Switcher */}
          <div className="space-y-4">
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setErrorMsg(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${authMode === 'login'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('register'); setErrorMsg(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${authMode === 'register'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </button>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                {authMode === 'login' ? 'Sign in to your account' : 'Register for an account'}
              </h2>
              <p className="text-sm text-slate-500">
                {authMode === 'login'
                  ? 'Enter your credentials to access your projects and scorecards.'
                  : 'Create a new account with standard Viewer permissions to access the platform.'}
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-lg">
              {errorMsg}
            </div>
          )}

          {/* SIGN IN FORM */}
          {authMode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-semibold text-slate-700 block">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@roseassociates.com"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#B5111B]/20 focus:border-[#B5111B] transition-all shadow-xs"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-semibold text-slate-700 block">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#B5111B]/20 focus:border-[#B5111B] transition-all shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-slate-300 text-[#B5111B] focus:ring-[#B5111B] h-4 w-4"
                  />
                  <span>Remember session with encrypted token</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#B5111B] hover:bg-[#8F0D15] text-white font-medium py-2.5 px-4 rounded-lg shadow-xs cursor-pointer transition-all duration-150 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Sign in</span>
                )}
              </button>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="reg-name" className="text-xs font-semibold text-slate-700 block">
                  Full Name
                </label>
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Jane Smith"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#B5111B]/20 focus:border-[#B5111B] transition-all shadow-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="reg-email" className="text-xs font-semibold text-slate-700 block">
                  Work Email Address
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="jane.smith@agency.gov"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#B5111B]/20 focus:border-[#B5111B] transition-all shadow-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="reg-dept" className="text-xs font-semibold text-slate-700 block">
                  Department / Organization
                </label>
                <input
                  id="reg-dept"
                  type="text"
                  value={regDepartment}
                  onChange={(e) => setRegDepartment(e.target.value)}
                  placeholder="e.g. Planning Board, Regional Council"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#B5111B]/20 focus:border-[#B5111B] transition-all shadow-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="reg-password" className="text-xs font-semibold text-slate-700 block">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 6 characters (hashed with Argon2)"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#B5111B]/20 focus:border-[#B5111B] transition-all shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Instant Active Access</span>
                </div>
                <div>New registrations are automatically granted immediate Viewer role access. Admins can upgrade permissions at any time.</div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#B5111B] hover:bg-[#8F0D15] text-white font-medium py-2.5 px-4 rounded-lg shadow-xs cursor-pointer transition-all duration-150 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>
          )}

          {/* Quick Demo Credentials for Testing All 4 RBAC Roles */}
          {authMode === 'login' && (
            <div className="p-4 rounded-2xl bg-slate-100/90 border border-slate-200/90 space-y-3 font-sans">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Quick Demo RBAC Roles
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Click to populate</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {demoAccounts.map((acc) => {
                  const Icon = acc.icon
                  const isSelected = email === acc.email
                  return (
                    <button
                      key={acc.role}
                      type="button"
                      onClick={() => handleFillDemo(acc.email, acc.pass)}
                      className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${isSelected
                          ? 'border-[#B5111B] bg-red-50/60 ring-2 ring-[#B5111B]/20'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                      <div className="flex items-center justify-between gap-1 w-full mb-1">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Icon className="w-3.5 h-3.5 text-[#B5111B]" />
                          <span>{acc.role}</span>
                        </span>
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {acc.badge}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate w-full font-mono">{acc.email}</div>
                      <div className="text-[10px] text-slate-400 truncate w-full pt-0.5">{acc.desc}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="text-center text-xs text-slate-500 pt-6">
          Having trouble signing in? Contact <a href="mailto:support@roseassociates.com" className="text-slate-700 font-medium hover:underline">Rose Associates Support</a>
        </div>
      </div>
    </div>
  )
}
