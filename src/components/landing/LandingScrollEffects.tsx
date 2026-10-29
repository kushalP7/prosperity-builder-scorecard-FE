"use client"

import * as React from "react"
import { usePathname } from "@/lib/router-compat"

/**
 * Global landing-page scroll motion (Knovea-style).
 * Mounted once via LandingHeader so every public landing route gets reveals
 * on <main> sections without editing each page.
 */
export function LandingScrollEffects() {
  const pathname = usePathname()

  React.useEffect(() => {
    if (typeof window === "undefined") return

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const main = document.querySelector("main")
    if (!main) return

    const markStagger = (section: HTMLElement) => {
      const contentRoot =
        section.querySelector<HTMLElement>("[data-reveal-stagger]") ||
        section.querySelector<HTMLElement>(".max-w-7xl") ||
        null

      if (!contentRoot) return

      contentRoot.classList.add("reveal-stagger")
      const kids = Array.from(contentRoot.children).filter(
        (child): child is HTMLElement =>
          child instanceof HTMLElement &&
          !child.classList.contains("absolute") &&
          child.dataset.revealSkip !== "true",
      )
      kids.forEach((child, i) => {
        child.classList.add("reveal-child")
        child.style.setProperty("--reveal-child-index", String(i))
      })
    }

    const collectTargets = (): HTMLElement[] => {
      const sections = Array.from(main.querySelectorAll("section")).filter(
        (s): s is HTMLElement =>
          s instanceof HTMLElement &&
          !s.parentElement?.closest("section") &&
          s.dataset.revealSkip !== "true" &&
          s.dataset.revealOwned !== "manual",
      )
      const banners = Array.from(
        main.querySelectorAll<HTMLElement>("[data-page-hero], .landing-page-hero"),
      ).filter((el) => !el.closest("section") && el.dataset.revealSkip !== "true")
      return [...sections, ...banners]
    }

    const previous = (main as HTMLElement & { __revealObserver?: IntersectionObserver }).__revealObserver
    previous?.disconnect()

    const targets = collectTargets()

    if (reduced) {
      targets.forEach((el) => {
        el.classList.add("scroll-reveal", "reveal-up", "reveal-scale", "is-inview")
        markStagger(el)
      })
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add("is-inview")
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    )

    targets.forEach((section) => {
      const rect = section.getBoundingClientRect()
      const aboveFold = rect.top < window.innerHeight * 0.9 && rect.bottom > 40

      markStagger(section)

      if (aboveFold) {
        // Keep above-fold content visible — only light stagger when already painted
        section.classList.add("scroll-reveal", "reveal-up", "reveal-scale", "is-inview")
        return
      }

      // Below-fold: hide then reveal on scroll (no flash — not on screen yet)
      section.classList.add("scroll-reveal", "reveal-up", "reveal-scale")
      section.classList.remove("is-inview")
      observer.observe(section)
    })

    ;(main as HTMLElement & { __revealObserver?: IntersectionObserver }).__revealObserver = observer

    return () => {
      observer.disconnect()
    }
  }, [pathname])

  return null
}
