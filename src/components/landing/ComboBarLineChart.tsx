"use client"

export function ComboBarLineChart() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4 hover:shadow-md transition-shadow">
      <div className="space-y-0.5 border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-900">Accessibility & Transportation Value Overview</h3>
        <p className="text-[10px] text-slate-400 font-mono">Regional infrastructure evaluation</p>
      </div>

      <div className="flex justify-center items-center py-2">
        <svg viewBox="0 0 200 200" className="w-44 h-44">
          <circle cx="100" cy="100" r="64" fill="none" stroke="#6D0A10" strokeWidth="32" strokeDasharray="70 332" strokeDashoffset="0" />
          <circle cx="100" cy="100" r="64" fill="none" stroke="#B5111B" strokeWidth="32" strokeDasharray="85 317" strokeDashoffset="-75" />
          <circle cx="100" cy="100" r="64" fill="none" stroke="#C44149" strokeWidth="32" strokeDasharray="75 327" strokeDashoffset="-165" />
          <circle cx="100" cy="100" r="64" fill="none" stroke="#888585" strokeWidth="32" strokeDasharray="80 322" strokeDashoffset="-245" />
          <circle cx="100" cy="100" r="64" fill="none" stroke="#222121" strokeWidth="32" strokeDasharray="70 332" strokeDashoffset="-330" />

          <text x="100" y="92" className="text-[9px] font-bold fill-slate-400 uppercase tracking-wider font-sans" textAnchor="middle">TOTAL</text>
          <text x="100" y="112" className="text-xl font-black fill-slate-900 font-sans" textAnchor="middle">18.4</text>
        </svg>
      </div>

      <div className="pt-3 border-t border-slate-100 flex flex-wrap justify-center gap-1.5 text-xs">
        <span className="bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md text-[10px] font-semibold text-slate-700">Major Routes 22% (4.1)</span>
        <span className="bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md text-[10px] font-semibold text-slate-700">HH w/o Vehicle 26% (4.8)</span>
        <span className="bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md text-[10px] font-semibold text-slate-700">Avg Commute 23% (4.2)</span>
        <span className="bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md text-[10px] font-semibold text-slate-700">Transit 29% (5.3)</span>
      </div>
    </div>
  )
}
