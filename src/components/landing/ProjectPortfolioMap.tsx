"use client"

import * as React from "react"
import { LandingProjectItem } from "@/lib/projects-api"
import "leaflet/dist/leaflet.css"

interface ProjectPortfolioMapProps {
  projects: LandingProjectItem[]
  focusedProject?: LandingProjectItem | null
  onMarkerClick?: (project: LandingProjectItem) => void
}

export default function ProjectPortfolioMap({
  projects,
  focusedProject,
  onMarkerClick,
}: ProjectPortfolioMapProps) {
  const mapContainerRef = React.useRef<HTMLDivElement>(null)
  const mapInstanceRef = React.useRef<any>(null)
  const markersRef = React.useRef<Map<string, any>>(new Map())
  const projectsRef = React.useRef<LandingProjectItem[]>(projects)
  const [isClient, setIsClient] = React.useState(false)

  // Keep projectsRef synchronized with prop
  React.useEffect(() => {
    projectsRef.current = projects
  }, [projects])

  React.useEffect(() => {
    setIsClient(true)
  }, [])

  // Custom Rose Associates SVG Map Pin Icon
  const createPinIcon = (L: any) => {
    return L.divIcon({
      className: "rose-map-pin-wrapper",
      html: `
        <div style="
          position: relative;
          width: 32px;
          height: 42px;
          cursor: pointer;
          filter: drop-shadow(0 4px 6px rgba(0,0,0,0.35));
        ">
          <svg viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
            <path d="M16 0C7.163 0 0 7.163 0 16C0 26.5 16 42 16 42C16 42 32 26.5 32 16C32 7.163 24.837 0 16 0Z" fill="#B5111B"/>
            <circle cx="16" cy="16" r="6" fill="#FFFFFF"/>
          </svg>
        </div>
      `,
      iconSize: [32, 42],
      iconAnchor: [16, 42],
      popupAnchor: [0, -42],
    })
  }

  // Open every single marker popup on the map
  const openAllPopups = () => {
    markersRef.current.forEach((marker) => {
      if (marker && typeof marker.openPopup === "function") {
        marker.openPopup()
      }
    })
  }

  // Render Markers
  const renderMarkers = (L: any, map: any) => {
    if (!map) return

    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current.clear()

    const currentProjects = projectsRef.current || []
    if (currentProjects.length === 0) {
      map.setView([35.209, -80.497], 7, { animate: false })
      return
    }

    const pinIcon = createPinIcon(L)

    currentProjects.forEach((proj) => {
      if (typeof proj.latitude !== "number" || typeof proj.longitude !== "number") return

      const marker = L.marker([proj.latitude, proj.longitude], { icon: pinIcon }).addTo(map)

      // Popup Content matching Rose Associates original UI
      const popupHtml = `
        <div class="rose-portfolio-popup" style="
          font-family: var(--font-sans, system-ui, sans-serif);
          text-align: center;
          padding: 6px 8px 4px;
          min-width: 140px;
          max-width: 190px;
        ">
          <h4 style="
            margin: 0 0 3px;
            font-size: 13px;
            font-weight: 700;
            color: #0f172a;
            line-height: 1.25;
          ">${proj.title}</h4>
          
          <p style="
            margin: 0 0 8px;
            font-size: 10.5px;
            color: #475569;
            font-weight: 500;
            line-height: 1.3;
          ">${proj.studyType || ""}</p>
          
          <a 
            href="${proj.pdfUrl || '#'}" 
            target="_blank" 
            rel="noopener noreferrer"
            class="view-project-btn"
            style="
              display: inline-block;
              background-color: #000000;
              color: #ffffff;
              font-size: 10.5px;
              font-weight: 700;
              padding: 5px 15px;
              border-radius: 9999px;
              text-decoration: none;
              box-shadow: 0 2px 5px rgba(0,0,0,0.22);
              transition: all 0.2s ease;
            "
            onmouseover="this.style.backgroundColor='#B5111B'; this.style.transform='scale(1.03)';"
            onmouseout="this.style.backgroundColor='#000000'; this.style.transform='scale(1)';"
          >
            View Project
          </a>
        </div>
      `

      // AutoClose: false & CloseOnClick: false keeps all pin popups open simultaneously
      marker.bindPopup(popupHtml, {
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
        className: "rose-custom-leaflet-popup",
        offset: [0, 0],
      })

      marker.on("click", () => {
        if (onMarkerClick) onMarkerClick(proj)
      })

      markersRef.current.set(proj.id, marker)
    })

    // Fit map bounds to encompass all pins and open popups nicely
    const validCoords = currentProjects
      .filter((p) => typeof p.latitude === "number" && typeof p.longitude === "number")
      .map((p) => [p.latitude, p.longitude] as [number, number])

    if (validCoords.length > 0) {
      const bounds = L.latLngBounds(validCoords)
      map.fitBounds(bounds, {
        paddingTopLeft: [40, 80],
        paddingBottomRight: [40, 40],
        maxZoom: 8,
        animate: false,
      })
    }

    map.invalidateSize()

    // Trigger open all popups immediately and with safety timers
    openAllPopups()
    setTimeout(openAllPopups, 80)
    setTimeout(openAllPopups, 250)
  }

  // Initialize Leaflet map
  React.useEffect(() => {
    if (!isClient || !mapContainerRef.current) return
    let L: any

    const initMap = async () => {
      L = (await import("leaflet")).default

      if (mapInstanceRef.current) return

      // Default center: Southeast NC/SC region
      const defaultCenter: [number, number] = [35.209, -80.497]
      const defaultZoom = 7

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: defaultZoom,
        scrollWheelZoom: true,
        zoomControl: true,
        attributionControl: false,
        closePopupOnClick: false,
      })

      // OpenStreetMap Carto tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map)

      // Add clean attribution in bottom right
      L.control.attribution({ position: "bottomright" }).addTo(map)

      // Maintain popups on user pan or zoom
      map.on("zoomend", () => {
        openAllPopups()
      })

      mapInstanceRef.current = map

      // Render markers immediately
      map.whenReady(() => {
        renderMarkers(L, map)
      })
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [isClient])

  // Update markers when projects list changes
  React.useEffect(() => {
    if (!mapInstanceRef.current) return
    import("leaflet").then((L) => {
      renderMarkers(L.default, mapInstanceRef.current)
    })
  }, [projects])

  // Pan / Zoom to focused project
  React.useEffect(() => {
    if (!focusedProject || !mapInstanceRef.current) return

    const map = mapInstanceRef.current
    const marker = markersRef.current.get(focusedProject.id)

    if (
      typeof focusedProject.latitude === "number" &&
      typeof focusedProject.longitude === "number"
    ) {
      map.setView([focusedProject.latitude, focusedProject.longitude], 10, {
        animate: true,
        duration: 0.8,
      })

      if (marker) {
        setTimeout(() => {
          marker.openPopup()
        }, 300)
      }
    }
  }, [focusedProject])

  if (!isClient) {
    return (
      <div className="w-full h-[520px] sm:h-[580px] lg:h-[620px] bg-slate-100 rounded-xl border border-slate-200 animate-pulse flex items-center justify-center text-slate-400 text-sm font-medium">
        Loading Interactive Map...
      </div>
    )
  }

  return (
    <div className="relative isolate z-0 w-full h-[520px] sm:h-[580px] lg:h-[620px] rounded-xl overflow-hidden shadow-sm border border-slate-200 group">
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Subtle notification when category has no map pins */}
      {projects.length === 0 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-xs border border-slate-200/90 px-4 py-1.5 rounded-full shadow-md text-xs font-semibold text-slate-600">
            No map pins for this category
          </div>
        </div>
      )}

      {/* Global CSS for Leaflet Popups */}
      <style jsx global>{`
        .rose-custom-leaflet-popup {
          bottom: 0 !important;
        }
        .rose-custom-leaflet-popup .leaflet-popup-content-wrapper {
          border-radius: 16px !important;
          box-shadow: 0 12px 28px -4px rgba(0, 0, 0, 0.22), 0 4px 10px -2px rgba(0, 0, 0, 0.08) !important;
          padding: 4px !important;
          border: 1px solid rgba(226, 232, 240, 0.9);
        }
        .rose-custom-leaflet-popup .leaflet-popup-content {
          margin: 6px !important;
          line-height: 1.4 !important;
        }
        .rose-custom-leaflet-popup .leaflet-popup-tip {
          background: #ffffff !important;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15) !important;
        }
        .rose-custom-leaflet-popup a.leaflet-popup-close-button {
          top: 6px !important;
          right: 6px !important;
          color: #94a3b8 !important;
          padding: 2px !important;
          font-size: 14px !important;
        }
        .rose-custom-leaflet-popup a.leaflet-popup-close-button:hover {
          color: #b5111b !important;
        }
      `}</style>
    </div>
  )
}
