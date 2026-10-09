"use client"

import { Award, Compass, Building2, Mail, CheckCircle2, ShieldCheck, TrendingUp } from "lucide-react"

export function AboutUsSection() {
  return (
    <div className="bg-slate-50 text-slate-900 font-sans">

      {/* 1. EDITORIAL HERO HEADER */}
      <section className="relative bg-gradient-to-b from-slate-950 via-[#3B070B] to-slate-900 text-white py-16 sm:py-24 border-b border-red-950/80 overflow-hidden">
        {/* Subtle background glow pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(181,17,27,0.25),rgba(255,255,255,0))]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6 text-center max-w-4xl">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
            Architects of Community Prosperity & <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-white via-rose-100 to-[#E11D48] bg-clip-text text-transparent">
              Strategic Real Estate Advisory
            </span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-slate-300 font-normal leading-relaxed max-w-3xl mx-auto">
            Three decades of transforming how municipalities, institutions, and developers harmonize land use planning, economic growth, and quality of life across the Carolinas and Southeast.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-xl text-slate-300">
              <ShieldCheck className="w-4 h-4 text-[#E11D48]" />
              <span>Certified Woman-Owned Business</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-xl text-slate-300">
              <Award className="w-4 h-4 text-[#E11D48]" />
              <span>CCIM & CRE Designated Leadership</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE ORIGIN STORY: 1967 WORLD'S FAIR & GEODESIC VISION */}
      <section className="py-14 sm:py-20 bg-white border-b border-slate-200 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-snug">
                  From Buckminster Fuller’s Dome to a 30-Year Advisory Legacy
                </h2>
              </div>

              <div className="space-y-4 text-sm text-slate-600 leading-relaxed font-normal">
                <p className="first-letter:text-4xl first-letter:font-black first-letter:text-[#B5111B] first-letter:mr-2 first-letter:float-left">
                  Our inspiration lies in a 1967 visit to the World’s Fair (Expo 67) by <strong>Robert E. Rose</strong>, whose calling as a home builder, developer, and master craftsman was transformed by Buckminster Fuller’s iconic geodesic dome. Rose returned home with a revolutionary vision for construction—one that fully considered a structure’s relationship to people and to the land.
                </p>
                <p>
                  Since 1992, <strong>Kathleen Rose, CCIM, CRE</strong> has carried forward her father’s vision by building an advisory practice that uniquely integrates real estate strategy, land use planning, and economic development expertise.
                </p>
                <p>
                  Today, Rose Associates provides municipal leaders, institutions, and private clients with data-grounded frameworks that develop prosperity, elevate quality of life, and curate lasting balance in the built environment.
                </p>
              </div>

              {/* Stat Callouts */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                <div className="space-y-0.5">
                  <div className="text-2xl sm:text-3xl font-black text-[#B5111B]">30+</div>
                  <div className="text-[11px] font-bold text-slate-700">Years Industry Leadership</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-2xl sm:text-3xl font-black text-slate-900">90+</div>
                  <div className="text-[11px] font-bold text-slate-700">Verified Quality Metrics</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-2xl sm:text-3xl font-black text-[#B5111B]">Top 25</div>
                  <div className="text-[11px] font-bold text-slate-700">CBJ Women in Business</div>
                </div>
              </div>
            </div>

            {/* Right Card Image/Quote Box */}
            <div className="lg:col-span-5">
              <div className="bg-gradient-to-br from-slate-900 via-[#3B070B] to-slate-950 text-white p-8 sm:p-10 rounded-3xl shadow-2xl relative space-y-6 border border-red-950/80">

                {/* Quote Section - Clean Flex Column Alignment */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#B5111B] to-[#E11D48] text-white flex items-center justify-center shadow-md shrink-0">
                    <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>

                  <blockquote className="italic text-sm sm:text-[15px] text-slate-100 leading-relaxed font-serif pt-1 flex-1">
                    &ldquo;A structure or community must never exist in isolation. True prosperity happens when land use, market realities, and human well-being align in seamless harmony.&rdquo;
                  </blockquote>
                </div>

                <div className="pt-5 border-t border-red-900/50 flex items-center gap-4">
                  <img
                    src="/team/kathleen_rose.png"
                    alt="Kathleen Rose, CCIM, CRE"
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-red-500/40 shadow-md shrink-0"
                  />
                  <div className="space-y-0.5 min-w-0">
                    <div className="text-base font-extrabold text-white truncate">Kathleen Rose, CCIM, CRE</div>
                    <div className="text-xs text-rose-200/90 font-medium truncate">Founder, President & CEO • Rose Associates</div>
                    <div className="text-[11px] text-slate-400 font-mono pt-0.5">Davidson, North Carolina</div>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3. THREE CORE PHILOSOPHY PILLARS */}
      <section className="py-14 sm:py-20 bg-slate-100/70 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#B5111B]">
              THE ROSE METHODOLOGY
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Our Core Advisory Philosophy
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-normal">
              How we translate complex economic realities into actionable community outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Pillar 1 */}
            <div className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-2xs space-y-4 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#B5111B] to-[#E11D48] text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-all">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Developing Prosperity
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connecting economic development strategies with private market feasibility to generate tax base growth, high-wage jobs, and resilient local economies.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-2xs space-y-4 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#B5111B] to-[#E11D48] text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-all">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Building Quality of Life
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Evaluating accessibility, public health, historic preservation, and recreational assets to build communities where people thrive and businesses invest.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-2xs space-y-4 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#B5111B] to-[#E11D48] text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-all">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Curating Built Balance
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Integrating site selection, land use planning, and architectural heritage to ensure commercial and residential growth complements environmental assets.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 4. EXPERT TEAM & LEADERSHIP SHOWCASE WITH BLURRED PHOTO BACKDROPS */}
      <section className="py-16 sm:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#B5111B]">
              LEADERSHIP & EXPERTISE
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Meet Our Senior Leadership Team
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-normal">
              Seasoned advisors with decades of real estate, economic analytics, and urban planning credentials.
            </p>
          </div>

          {/* Executive Leadership Stack (Horizontal Row Format) */}
          <div className="space-y-6">

            {/* Executive 1: Kathleen Rose */}
            <div className="bg-slate-50/70 hover:bg-white rounded-3xl border border-slate-200/90 hover:border-red-950/20 p-6 sm:p-8 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row items-stretch gap-6 lg:gap-8 group">

              {/* Left Column: Headshot Card */}
              <div className="w-full md:w-56 lg:w-64 shrink-0 flex flex-col items-center justify-between p-5 bg-gradient-to-b from-slate-900 via-slate-900 to-[#3B0105] rounded-2xl border border-slate-800 shadow-md relative overflow-hidden text-center min-h-[220px]">
                <div
                  className="absolute inset-0 bg-cover bg-center filter blur-xl opacity-40 scale-150 transition-transform duration-700 group-hover:scale-175"
                  style={{ backgroundImage: `url('/team/kathleen_rose.png')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />

                <div className="relative z-10 space-y-3 w-full flex flex-col items-center">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-2 border-white/90 shadow-2xl overflow-hidden bg-slate-800 group-hover:scale-105 transition-transform duration-300">
                    <img
                      src="/team/kathleen_rose.png"
                      alt="Kathleen Rose, CCIM, CRE"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                  <span className="inline-block px-3 py-1 rounded-full bg-[#B5111B] text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                    FOUNDER & PRESIDENT
                  </span>
                </div>

                <div className="relative z-10 pt-3 border-t border-white/10 w-full flex flex-col items-center gap-2 mt-3">
                  <div className="text-center">
                    <div className="text-[11px] font-extrabold text-rose-200/90 italic">
                      &ldquo;Chief Problem Solver&rdquo;
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                      30+ Years Advisory Experience
                    </div>
                  </div>

                  {/* Social / Contact Icons */}
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <a
                      href="mailto:krose@roseassociates.com"
                      className="p-2 rounded-xl bg-white/10 hover:bg-[#B5111B] text-white border border-white/15 transition-colors"
                      title="Email Kathleen Rose"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                    <a
                      href="https://www.linkedin.com/in/roseassociates/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-white/10 hover:bg-[#0A66C2] text-white border border-white/15 transition-colors"
                      aria-label="Kathleen Rose LinkedIn"
                      title="LinkedIn Profile"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Column: Profile Content & Badges */}
              <div className="flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        Kathleen Rose, <span className="text-[#B5111B]">CCIM, CRE</span>
                      </h3>
                      <p className="text-xs font-bold text-slate-500 mt-0.5">
                        President & Founder, Rose Associates Advisory Firm
                      </p>
                    </div>

                    <a
                      href="mailto:krose@roseassociates.com"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#B5111B] hover:bg-[#8F0D15] text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>krose@roseassociates.com</span>
                    </a>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    Over three decades of commercial real estate and economic development leadership. Serves on the Board of Directors for the Counselors of Real Estate (CRE), CCIM Life Member & Faculty, and active ULI Carolinas WLI Champion. Recipient of Charlotte Business Journal&apos;s Top 25 Women in Business award.
                  </p>
                </div>

                {/* Key Appointments & Affiliations */}
                <div className="space-y-1.5 pt-2">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    KEY APPOINTMENTS & AFFILIATIONS
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "CCIM (Certified Commercial Investment Member) Life Faculty",
                      "CRE (Counselors of Real Estate) Board of Directors",
                      "NC Downtown Development Association Board",
                      "ULI Carolinas WLI Champion",
                      "Charlotte Business Journal Top 25 Women in Business"
                    ].map((badge, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-slate-200/90 text-slate-700 px-3 py-1.5 rounded-xl shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#B5111B] shrink-0" />
                        <span>{badge}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Executive 2: Daniel Bellot */}
            <div className="bg-slate-50/70 hover:bg-white rounded-3xl border border-slate-200/90 hover:border-red-950/20 p-6 sm:p-8 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row items-stretch gap-6 lg:gap-8 group">

              {/* Left Column: Headshot Card */}
              <div className="w-full md:w-56 lg:w-64 shrink-0 flex flex-col items-center justify-between p-5 bg-gradient-to-b from-slate-900 via-slate-900 to-[#1F2937] rounded-2xl border border-slate-800 shadow-md relative overflow-hidden text-center min-h-[220px]">
                <div
                  className="absolute inset-0 bg-cover bg-center filter blur-xl opacity-40 scale-150 transition-transform duration-700 group-hover:scale-175"
                  style={{ backgroundImage: `url('/team/daniel_bellot.png')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />

                <div className="relative z-10 space-y-3 w-full flex flex-col items-center">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-2 border-white/90 shadow-2xl overflow-hidden bg-slate-800 group-hover:scale-105 transition-transform duration-300">
                    <img
                      src="/team/daniel_bellot.png"
                      alt="Daniel Bellot"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                  <span className="inline-block px-3 py-1 rounded-full bg-[#B5111B] text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                    CHIEF ANALYST & BROKER
                  </span>
                </div>

                <div className="relative z-10 pt-3 border-t border-white/10 w-full flex flex-col items-center gap-2 mt-3">
                  <div className="text-center">
                    <div className="text-[11px] font-extrabold text-slate-200">
                      Economist & Spatial Analyst
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                      UNC Charlotte Economics
                    </div>
                  </div>

                  {/* Social / Contact Icons */}
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <a
                      href="mailto:dbellot@roseassociates.com"
                      className="p-2 rounded-xl bg-white/10 hover:bg-[#B5111B] text-white border border-white/15 transition-colors"
                      title="Email Daniel Bellot"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                    <a
                      href="https://www.linkedin.com/in/daniel-bellot-60b25811b/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-white/10 hover:bg-[#0A66C2] text-white border border-white/15 transition-colors"
                      aria-label="Daniel Bellot LinkedIn"
                      title="LinkedIn Profile"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Column: Profile Content & Badges */}
              <div className="flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        Daniel Bellot
                      </h3>
                      <p className="text-xs font-bold text-slate-500 mt-0.5">
                        Chief Analyst, GIS Spatial Research & Commercial Broker
                      </p>
                    </div>

                    <a
                      href="mailto:dbellot@roseassociates.com"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#B5111B] hover:bg-[#8F0D15] text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>dbellot@roseassociates.com</span>
                    </a>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    B.S. in Economics from UNC Charlotte. Leads the firm&apos;s data analytics, GIS-based spatial research, site selection modeling, and commercial brokerage operations. Experienced in municipal scorecard compilation and economic health assessments across North Carolina.
                  </p>
                </div>

                {/* Key Appointments & Affiliations */}
                <div className="space-y-1.5 pt-2">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    SPECIALIZATIONS & CERTIFICATIONS
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "B.S. Economics (UNC Charlotte Belk College of Business)",
                      "NC Licensed Commercial Broker",
                      "ULI Young Leaders Member",
                      "NCDDA Associate Member",
                      "GIS & Spatial Analytics Lead"
                    ].map((badge, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-slate-200/90 text-slate-700 px-3 py-1.5 rounded-xl shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#B5111B] shrink-0" />
                        <span>{badge}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Executive 3: Dr. William McCoy */}
            <div className="bg-slate-50/70 hover:bg-white rounded-3xl border border-slate-200/90 hover:border-red-950/20 p-6 sm:p-8 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row items-stretch gap-6 lg:gap-8 group">

              {/* Left Column: Headshot Card */}
              <div className="w-full md:w-56 lg:w-64 shrink-0 flex flex-col items-center justify-between p-5 bg-gradient-to-b from-slate-900 via-slate-900 to-[#3B0105] rounded-2xl border border-slate-800 shadow-md relative overflow-hidden text-center min-h-[220px]">
                <div
                  className="absolute inset-0 bg-cover bg-center filter blur-xl opacity-40 scale-150 transition-transform duration-700 group-hover:scale-175"
                  style={{ backgroundImage: `url('/team/dr_william_mccoy.png')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />

                <div className="relative z-10 space-y-3 w-full flex flex-col items-center">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-2 border-white/90 shadow-2xl overflow-hidden bg-slate-800 group-hover:scale-105 transition-transform duration-300">
                    <img
                      src="/team/dr_william_mccoy.png"
                      alt="Dr. William McCoy"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                  <span className="inline-block px-3 py-1 rounded-full bg-[#B5111B] text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                    SENIOR ADVISOR EMERITUS
                  </span>
                </div>

                <div className="relative z-10 pt-3 border-t border-white/10 w-full flex flex-col items-center gap-2 mt-3">
                  <div className="text-center">
                    <div className="text-[11px] font-extrabold text-rose-200">
                      Urban Planning & Policy
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                      40+ Years Academic Rigor
                    </div>
                  </div>

                  {/* Social / Contact Icons */}
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <a
                      href="mailto:info@roseassociates.com"
                      className="p-2 rounded-xl bg-white/10 hover:bg-[#B5111B] text-white border border-white/15 transition-colors"
                      title="Email Dr. William McCoy"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Column: Profile Content & Badges */}
              <div className="flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        Dr. William McCoy
                      </h3>
                      <p className="text-xs font-bold text-slate-500 mt-0.5">
                        Retired Director, UNC Charlotte Urban Institute & Professor Emeritus
                      </p>
                    </div>

                    <a
                      href="mailto:info@roseassociates.com"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#B5111B] hover:bg-[#8F0D15] text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>info@roseassociates.com</span>
                    </a>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    Retired Director of the UNC Charlotte Urban Institute and Professor Emeritus of Political Science. Ph.D. from Univ. of Tennessee. Brings over four decades of academic rigor to community engagement, public policy surveys, land use planning, and regional housing studies.
                  </p>
                </div>

                {/* Key Appointments & Affiliations */}
                <div className="space-y-1.5 pt-2">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    ACADEMIC CREDENTIALS & DISTINCTIONS
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Ph.D. Political Science (Univ. of Tennessee)",
                      "Former Director UNC Charlotte Urban Institute",
                      "Professor Emeritus of Political Science (UNC Charlotte)",
                      "NC National Bank Teaching Award Winner",
                      "40+ Years Public Policy Research"
                    ].map((badge, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-slate-200/90 text-slate-700 px-3 py-1.5 rounded-xl shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#B5111B] shrink-0" />
                        <span>{badge}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

    </div>
  )
}
