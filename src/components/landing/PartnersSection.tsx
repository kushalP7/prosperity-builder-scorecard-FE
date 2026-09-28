"use client"

export function PartnersSection() {
  const partnerList = [
    { id: "swh-1", name: "SeamonWhiteside", image: "/partners/partner_seamonwhiteside.png" },
    { id: "boudreaux-1", name: "BOUDREAUX", image: "/partners/partner_boudreaux.png" },
    { id: "uli-1", name: "Urban Land Institute", image: "/partners/partner_uli.png" },
    { id: "vhb-1", name: "VHB", image: "/partners/partner_vhb.png" },
    { id: "ls3p-1", name: "LS3P", image: "/partners/partner_ls3p.png" },
    { id: "iedc-1", name: "IEDC", image: "/partners/partner_iedc.png" },
    { id: "bolton-menk-1", name: "Bolton & Menk", image: "/partners/partner_boltonmenk.png" },
    { id: "stantec-1", name: "Stantec", image: "/partners/partner_stantec.png" },
    { id: "clarion-1", name: "Clarion", image: "/partners/partner_clarion.png" },
    { id: "ccim-1", name: "The CCIM Institute", image: "/partners/partner_ccim.png" },
    { id: "mcadams-1", name: "McAdams", image: "/partners/partner_mcadams.png" },
    { id: "stewart-1", name: "Stewart", image: "/partners/partner_stewart.png" },
    { id: "cre-1", name: "CRE", image: "/partners/partner_cre.png" },
    // Duplicated set for seamless loop
    { id: "swh-2", name: "SeamonWhiteside", image: "/partners/partner_seamonwhiteside.png" },
    { id: "boudreaux-2", name: "BOUDREAUX", image: "/partners/partner_boudreaux.png" },
    { id: "uli-2", name: "Urban Land Institute", image: "/partners/partner_uli.png" },
    { id: "vhb-2", name: "VHB", image: "/partners/partner_vhb.png" },
    { id: "ls3p-2", name: "LS3P", image: "/partners/partner_ls3p.png" },
    { id: "iedc-2", name: "IEDC", image: "/partners/partner_iedc.png" },
    { id: "bolton-menk-2", name: "Bolton & Menk", image: "/partners/partner_boltonmenk.png" },
    { id: "stantec-2", name: "Stantec", image: "/partners/partner_stantec.png" },
    { id: "clarion-2", name: "Clarion", image: "/partners/partner_clarion.png" },
    { id: "ccim-2", name: "The CCIM Institute", image: "/partners/partner_ccim.png" },
    { id: "mcadams-2", name: "McAdams", image: "/partners/partner_mcadams.png" },
    { id: "stewart-2", name: "Stewart", image: "/partners/partner_stewart.png" },
    { id: "cre-2", name: "CRE", image: "/partners/partner_cre.png" },
  ]

  return (
    <section id="project-partners" className="scroll-mt-20 py-6 sm:py-8 bg-white border-b border-slate-200/80 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Project <span className="text-[#B5111B]">Partners</span>
          </h2>
        </div>

        <div className="relative w-full overflow-hidden py-2">
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-white via-white/90 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-white via-white/90 to-transparent z-10 pointer-events-none" />

          <div className="flex animate-marquee gap-8 sm:gap-12 md:gap-14 items-center">
            {partnerList.map((partner, idx) => (
              <div
                key={`${partner.id}-${idx}`}
                className="shrink-0 flex items-center justify-center px-3 py-1 hover:scale-105 transition-transform duration-300 cursor-pointer"
                title={partner.name}
              >
                <img
                  src={partner.image}
                  alt={partner.name}
                  draggable={false}
                  className="h-10 sm:h-12 md:h-14 w-auto max-w-[130px] sm:max-w-[170px] object-contain drop-shadow-2xs select-none pointer-events-none"
                />
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
