import { useRef, type PointerEvent } from 'react'
import { motion, useInView } from 'framer-motion'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useReducedMotion } from '../lib/animation-utils'

gsap.registerPlugin(useGSAP)

const steps = [
  {
    number: '01',
    label: 'Step 01',
    title: 'Jump in instantly',
    description: 'Create a free account or browse as a guest with zero friction. Start listening immediately without waiting.',
    detail: 'No credit card, no paywall - just a polished onboarding flow that keeps people engaged.',
    color: 'linear-gradient(135deg, var(--accent), #e04a25)',
    blobColor: 'linear-gradient(135deg, var(--accent), #e04a25)',
  },
  {
    number: '02',
    label: 'Step 02',
    title: 'Browse curated playlists',
    description: 'Explore a hand-picked music catalog designed for discovery and mood-based listening.',
    detail: 'Content is organized so listeners can find the right track without friction.',
    color: 'linear-gradient(135deg, #0f3554, #3f88c5)',
    blobColor: 'linear-gradient(135deg, #0f3554, #3f88c5)',
  },
  {
    number: '03',
    label: 'Step 03',
    title: 'Discover your music',
    description: 'Search by track, album, artist, or mood and find the perfect song in seconds.',
    detail: 'Smart filters and curated recommendations make your catalog feel premium.',
    color: 'linear-gradient(135deg, #4b2f18, #b67339)',
    blobColor: 'linear-gradient(135deg, #4b2f18, #b67339)',
  },
  {
    number: '04',
    label: 'Step 04',
    title: 'Enjoy anytime',
    description: 'A beautiful player, persistent queue, and library tools keep users coming back.',
    detail: 'Playback flows across the app, so your landing page feels like a complete music experience.',
    color: 'linear-gradient(135deg, #7b2d8b, #190e2e)',
    blobColor: 'linear-gradient(135deg, #7b2d8b, #190e2e)',
  },
]

const carouselSteps = [...steps, ...steps]
const marqueePixelsPerSecond = 42

export default function HowItWorks() {
  const titleRef = useRef<HTMLDivElement>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const loopDistanceRef = useRef(0)
  const isDraggingRef = useRef(false)
  const dragStartPointerXRef = useRef(0)
  const dragStartTrackXRef = useRef(0)
  const prefersReducedMotion = useReducedMotion()
  const titleInView = useInView(titleRef, { once: true, margin: '-60px' })

  const wrapTrackX = (value: number) => {
    const loopDistance = loopDistanceRef.current
    return loopDistance ? gsap.utils.wrap(-loopDistance, 0, value) : value
  }

  useGSAP(
    () => {
      const track = trackRef.current
      if (!track) return undefined

      timelineRef.current?.kill()
      timelineRef.current = null

      if (prefersReducedMotion) {
        gsap.set(track, { clearProps: 'transform,willChange' })
        return undefined
      }

      const createMarquee = () => {
        timelineRef.current?.kill()

        const firstDuplicate = track.children[steps.length] as HTMLElement | undefined
        const loopDistance = firstDuplicate?.offsetLeft ?? track.scrollWidth / 2
        loopDistanceRef.current = loopDistance

        gsap.set(track, {
          x: 0,
          force3D: true,
          willChange: 'transform',
        })

        timelineRef.current = gsap.timeline({ repeat: -1 })
          .to(track, {
            x: -loopDistance,
            duration: Math.max(24, loopDistance / marqueePixelsPerSecond),
            ease: 'none',
          })
          .set(track, { x: 0 })
      }

      createMarquee()

      const resizeObserver = new ResizeObserver(createMarquee)
      resizeObserver.observe(track)

      return () => {
        resizeObserver.disconnect()
        timelineRef.current?.kill()
        timelineRef.current = null
        gsap.set(track, { clearProps: 'transform,willChange' })
      }
    },
    { dependencies: [prefersReducedMotion], scope: carouselRef }
  )

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !trackRef.current || !timelineRef.current) return

    isDraggingRef.current = true
    dragStartPointerXRef.current = event.clientX
    dragStartTrackXRef.current = Number(gsap.getProperty(trackRef.current, 'x')) || 0
    timelineRef.current.pause()
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !trackRef.current || !timelineRef.current) return

    const nextX = wrapTrackX(dragStartTrackXRef.current + event.clientX - dragStartPointerXRef.current)
    const progress = loopDistanceRef.current ? (nextX + loopDistanceRef.current) / loopDistanceRef.current : 0

    gsap.set(trackRef.current, { x: nextX })
    timelineRef.current.progress(progress).pause()
  }

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return

    isDraggingRef.current = false
    event.currentTarget.releasePointerCapture(event.pointerId)
    timelineRef.current?.resume()
  }

  return (
    <section id="how-it-works" className="landing-reveal relative overflow-hidden px-4 pb-28 pt-16">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-24 top-10 w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,92,53,0.12) 0%, transparent 70%)' }} />
        <div className="absolute right-0 bottom-0 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(240,165,0,0.08) 0%, transparent 70%)' }} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div ref={titleRef} className="mb-16 text-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={titleInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
          >
            The flow
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 32 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 mx-auto max-w-3xl text-4xl font-semibold leading-tight"
            style={{ fontFamily: 'var(--serif)', color: 'var(--text)' }}
          >
            How Symponify brings a listener-first music experience to every screen.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="mt-5 text-base leading-relaxed text-[var(--text-2)] max-w-2xl mx-auto"
          >
            Four simple steps guide listeners from discovery to playback with a premium interface and fast, polished interactions.
          </motion.p>
        </div>

        <div
          ref={carouselRef}
          className="relative mx-auto w-[82vw] max-w-[390px] overflow-hidden sm:mx-0 sm:w-full sm:max-w-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div ref={trackRef} className="flex w-max touch-pan-y select-none gap-6" aria-label="How Symponify works">
            {carouselSteps.map((step, index) => (
              <div
                key={`${step.number}-${index}`}
                aria-hidden={index >= steps.length}
                className="how-step-card relative min-h-[245px] w-[82vw] max-w-[390px] shrink-0 overflow-hidden rounded-[32px] border border-[rgba(26,26,24,0.08)] bg-white/85 p-6 shadow-[0_24px_60px_rgba(31,23,9,0.08)] sm:w-[calc((100dvw-7rem)/2)] sm:p-8 lg:w-[calc((72rem-3rem)/3)]"
              >
                <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full opacity-20" style={{ background: step.blobColor }} />
                <div className="relative z-10 flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-semibold text-white" style={{ background: step.color }}>
                    {step.number}
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">{step.label}</p>
                    <h3 className="mt-3 text-2xl font-semibold text-[var(--text)]">{step.title}</h3>
                  </div>
                </div>
                <p className="mt-6 text-sm leading-7 text-[var(--text-2)]">{step.description}</p>
                <p className="mt-4 text-sm text-[var(--text-3)]">{step.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
