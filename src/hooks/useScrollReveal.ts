import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// iOS Safari fires resize events as its address bar shows/hides while scrolling,
// which otherwise makes ScrollTrigger re-measure mid-scroll and can reset or
// misfire reveals on mobile.
ScrollTrigger.config({ ignoreMobileResize: true })

interface ScrollRevealOptions {
  y?: number
  delay?: number
  start?: string
}

export function useScrollReveal<T extends HTMLElement>(options: ScrollRevealOptions = {}) {
  const ref = useRef<T>(null)
  const { y = 32, delay = 0, start = 'top 82%' } = options

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(el, { opacity: 1, y: 0 })
      return
    }

    const ctx = gsap.context(() => {
      gsap.from(el, {
        opacity: 0,
        y,
        duration: 0.7,
        delay,
        ease: 'power2.out',
        immediateRender: true,
        scrollTrigger: { trigger: el, start },
      })
    })

    return () => ctx.revert()
  }, [y, delay, start])

  return ref
}
