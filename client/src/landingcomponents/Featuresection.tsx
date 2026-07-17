import { useLayoutEffect, useRef } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SvgIcon } from '../components/IconBadge'
import { useReducedMotion } from '../lib/animation-utils'

gsap.registerPlugin(ScrollTrigger)

const features = [
  { icon: 'headphones', title: 'Immersive Player', desc: 'Silky-smooth player with waveform viz, queue management and keyboard shortcuts \u2014 built for audiophiles.', tag: 'Core', color: 'linear-gradient(135deg, #ff5c35, #ff8c6a)' },
  { icon: 'library', title: 'Curated Library', desc: 'Browse a thoughtfully organized catalog with playlists, albums, and featured tracks that feel effortless to explore.', tag: 'Library', color: 'linear-gradient(135deg, #0f3554, #3f88c5)' },
  { icon: 'search', title: 'Smart Search', desc: 'Find any song, album, or artist instantly. Filter by genre, album, or mood \u2014 always the right result.', tag: 'Discovery', color: 'linear-gradient(135deg, #4b2f18, #b67339)' },
  { icon: 'heart', title: 'Liked Songs', desc: 'Heart tracks you love. Your library stays in sync and waits for you on any device.', tag: 'Personal', color: 'linear-gradient(135deg, #190e2e, #7b2d8b)' },
  { icon: 'globe', title: 'Everywhere Access', desc: 'Listen on phone, tablet, or desktop. Your queue and favorites follow you across all devices.', tag: 'Sync', color: 'linear-gradient(135deg, #1a3a1a, #2e7d32)' },
  { icon: 'zap', title: 'Lightning Fast', desc: 'Stream without buffering. Instant playback and smooth navigation across the entire app.', tag: 'Speed', color: 'linear-gradient(135deg, #3a1a1a, #c62828)' },
]

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const stackRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLElement | null)[]>([])
  const titleRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const titleInView = useInView(titleRef, { once: true, margin: '-60px' })

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const bgY = useTransform(scrollYProgress, [0, 1], [-60, 60])
  const bgScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 0.95])

  useLayoutEffect(() => {
    if (!sectionRef.current || !stackRef.current) return undefined

    const media = gsap.matchMedia()
    const context = gsap.context(() => {
      media.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        const cards = cardsRef.current.filter(Boolean) as HTMLElement[]
        if (!cards.length) return undefined

        gsap.set(cards, { transformOrigin: 'top center', force3D: true })
        gsap.set(cards[0], { y: 0, yPercent: 0, scale: 1, opacity: 1, zIndex: 1 })
        gsap.set(cards.slice(1), { y: 0, yPercent: 120, scale: 0.96, opacity: 0.9 })

        const timeline = gsap.timeline({
          defaults: { duration: 1, ease: 'none' },
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: () => '+=' + cards.length * window.innerHeight,
            scrub: true,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })

        cards.slice(1).forEach((card, incomingIndex) => {
          const index = incomingIndex + 1
          const position = incomingIndex

          cards.slice(0, index).forEach((previousCard, previousIndex) => {
            timeline.to(
              previousCard,
              { scale: 1 - 0.02 * (index - previousIndex), overwrite: 'auto' },
              position,
            )
          })

          timeline.to(
            card,
            { yPercent: 0, y: index * 12, scale: 1, opacity: 1, zIndex: index + 1 },
            position,
          )
        })

        requestAnimationFrame(() => ScrollTrigger.refresh())
        return () => timeline.kill()
      })
    }, sectionRef)

    return () => {
      media.revert()
      context.revert()
    }
  }, [])

  return (
    <section
      id="features"
      ref={sectionRef}
      className="feature-stack-section landing-reveal relative overflow-hidden px-4"
    >
      <motion.div
        style={prefersReducedMotion ? undefined : { y: bgY, scale: bgScale }}
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div
          style={{
            width: 700,
            height: 700,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(240,165,0,0.06) 0%, transparent 70%)',
          }}
        />
      </motion.div>

      <div className="feature-stack-inner relative z-10 mx-auto max-w-6xl">
        <div ref={titleRef} className="feature-stack-copy text-center">
          <motion.span
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.8, y: 20 }}
            animate={titleInView ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.15em]"
            style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
          >
            Everything you need
          </motion.span>
          <motion.h2
            initial={prefersReducedMotion ? false : { opacity: 0, y: 40, scale: 0.95 }}
            animate={titleInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mb-4"
            style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', lineHeight: 1.1 }}
          >
            Built for music lovers,{' '}
            <motion.em
              initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
              animate={titleInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.35, duration: 0.6 }}
            >
              by music lovers.
            </motion.em>
          </motion.h2>
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="mx-auto max-w-xl text-lg"
            style={{ color: 'var(--text-2)' }}
          >
            Every feature was designed to get out of the way and let you enjoy the music.
          </motion.p>
        </div>

        <div ref={stackRef} className="feature-stack-viewport">
          {features.map((feature, index) => (
            <article
              key={feature.title}
              ref={(element) => { cardsRef.current[index] = element }}
              className="feature-stack-card"
              style={{ zIndex: index + 1 }}
            >
              <FeatureCard feature={feature} />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({
  feature,
}: {
  feature: typeof features[0],
}) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      whileHover={prefersReducedMotion ? undefined : { scale: 1.005 }}
      className="feature-stack-card-surface relative flex h-full w-full min-w-0 cursor-default flex-col justify-center overflow-hidden rounded-[28px] border p-6 sm:p-8"
      style={{
        background: 'rgba(255,255,255,0.985)',
        border: '1px solid var(--line)',
        boxShadow: '0 24px 64px rgba(31,23,9,0.14)',
        transformStyle: 'preserve-3d',
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
      }}
    >
      <motion.div
        initial={{ x: '-100%', opacity: 0 }}
        whileHover={prefersReducedMotion ? undefined : { x: '200%', opacity: 0.12 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(105deg, transparent 40%, white 50%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        className="mb-6 flex h-14 w-14 items-center justify-center rounded-[20px] text-2xl sm:mb-8 sm:h-16 sm:w-16 sm:rounded-[22px]"
        style={{ background: feature.color }}
        whileHover={prefersReducedMotion ? undefined : { rotate: [0, -8, 8, 0], scale: 1.08 }}
        transition={{ duration: 0.5 }}
      >
        <SvgIcon name={feature.icon} size={28} />
      </motion.div>

      <span
        className="absolute right-5 top-5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
        style={{ background: 'var(--surface-3)', color: 'var(--text-3)' }}
      >
        {feature.tag}
      </span>

      <h3
        className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl"
        style={{ color: 'var(--text)', fontFamily: 'var(--serif)', lineHeight: 1.05 }}
      >
        {feature.title}
      </h3>
      <p className="max-w-2xl text-base leading-7 sm:text-lg sm:leading-8" style={{ color: 'var(--text-2)' }}>
        {feature.desc}
      </p>
    </motion.div>
  )
}
