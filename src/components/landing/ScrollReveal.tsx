"use client"

import * as React from "react"
import { clsx } from "clsx"

type RevealVariant = "up" | "fade" | "scale" | "left" | "right"

interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: keyof React.JSX.IntrinsicElements
  variant?: RevealVariant
  delay?: number
  stagger?: boolean
  once?: boolean
  /** Animate immediately on mount (hero / above-fold) instead of waiting for scroll */
  immediate?: boolean
  children: React.ReactNode
}

const variantClass: Record<RevealVariant, string> = {
  up: "reveal-up",
  fade: "reveal-fade",
  scale: "reveal-scale",
  left: "reveal-left",
  right: "reveal-right",
}

export function ScrollReveal({
  as = "div",
  variant = "up",
  delay = 0,
  stagger = false,
  once = true,
  immediate = false,
  className,
  style,
  children,
  ...rest
}: ScrollRevealProps) {
  const ref = React.useRef<HTMLElement | null>(null)
  const [visible, setVisible] = React.useState(immediate)

  React.useEffect(() => {
    const el = ref.current
    if (!el || immediate) return

    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setVisible(false)
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [immediate, once])

  const Comp = as as React.ElementType

  return (
    <Comp
      ref={ref}
      className={clsx(
        "scroll-reveal",
        variantClass[variant],
        stagger && "reveal-stagger",
        visible && "is-inview",
        className,
      )}
      style={{
        ...style,
        ...(delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : null),
      }}
      {...rest}
    >
      {children}
    </Comp>
  )
}
