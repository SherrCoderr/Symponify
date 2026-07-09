import { useCallback, useEffect, useRef } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '../lib/animation-utils'

gsap.registerPlugin(ScrollTrigger)

const defaultOffset = -96

export default function useSmoothScroll(rootRef) {
  const lenisRef = useRef(null)
  const rafRef = useRef(0)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    const root = rootRef?.current
    if (!root) return undefined

    const revealItems = gsap.utils.toArray(root.querySelectorAll('.landing-reveal'))
    let context

    if (!prefersReducedMotion && revealItems.length) {
      context = gsap.context(() => {
        revealItems.forEach((item, index) => {
          gsap.fromTo(
            item,
            { autoAlpha: 0, y: 34 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.78,
              delay: Math.min(index * 0.04, 0.16),
              ease: 'power3.out',
              scrollTrigger: {
                trigger: item,
                start: 'top 82%',
                once: true,
              },
            }
          )
        })
      }, root)
    }

    if (prefersReducedMotion) {
      document.documentElement.style.scrollBehavior = 'smooth'
      return () => {
        document.documentElement.style.scrollBehavior = ''
        context?.revert()
      }
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.1,
    })

    lenisRef.current = lenis
    lenis.on('scroll', ScrollTrigger.update)

    const raf = (time) => {
      lenis.raf(time)
      rafRef.current = requestAnimationFrame(raf)
    }

    rafRef.current = requestAnimationFrame(raf)
    ScrollTrigger.refresh()

    return () => {
      cancelAnimationFrame(rafRef.current)
      lenis.off('scroll', ScrollTrigger.update)
      lenis.destroy()
      lenisRef.current = null
      context?.revert()
      ScrollTrigger.refresh()
    }
  }, [prefersReducedMotion, rootRef])

  const scrollToSection = useCallback(
    (target) => {
      const selector = target?.startsWith('#') ? target : `#${target}`
      const element = document.querySelector(selector)
      if (!element) return false

      if (prefersReducedMotion || !lenisRef.current) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else {
        lenisRef.current.scrollTo(element, {
          offset: defaultOffset,
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
        })
      }

      if (selector) {
        window.history.replaceState(null, '', selector)
      }

      return true
    },
    [prefersReducedMotion]
  )

  return { scrollToSection }
}
