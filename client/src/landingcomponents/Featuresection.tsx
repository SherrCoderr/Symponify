import { useRef } from 'react'
import { motion, useScroll, useTransform, useInView, useSpring } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { SvgIcon } from '../components/IconBadge'
import useViewport from '../hooks/useViewport'
import { useReducedMotion } from '../lib/animation-utils'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const features = [
  { icon: 'headphones', title: 'Immersive Player', desc: 'Silky-smooth player with waveform viz, queue management and keyboard shortcuts — built for audiophiles.', tag: 'Core', color: 'linear-gradient(135deg, #ff5c35, #ff8c6a)' },
  { icon: 'library', title: 'Curated Library', desc: 'Browse a thoughtfully organized catalog with playlists, albums, and featured tracks that feel effortless to explore.', tag: 'Library', color: 'linear-gradient(135deg, #0f3554, #3f88c5)' },
  { icon: 'search', title: 'Smart Search', desc: 'Find any song, album, or artist instantly. Filter by genre, album, or mood — always the right result.', tag: 'Discovery', color: 'linear-gradient(135deg, #4b2f18, #b67339)' },
  { icon: 'heart', title: 'Liked Songs', desc: 'Heart tracks you love. Your library stays in sync and waits for you on any device.', tag: 'Personal', color: 'linear-gradient(135deg, #190e2e, #7b2d8b)' },
  { icon: 'globe', title: 'Everywhere Access', desc: 'Listen on phone, tablet, or desktop. Your queue and favorites follow you across all devices.', tag: 'Sync', color: 'linear-gradient(135deg, #1a3a1a, #2e7d32)' },
  { icon: 'zap', title: 'Lightning Fast', desc: 'Stream without buffering. Instant playback and smooth navigation across the entire app.', tag: 'Speed', color: 'linear-gradient(135deg, #3a1a1a, #c62828)' },
]

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const stackRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement[]>([])
  const { isTabletOrBelow } = useViewport()
  const prefersReducedMotion = useReducedMotion()
  const titleInView = useInView(titleRef, { once: true, margin: '-60px' })
  const useStaticCards = isTabletOrBelow || prefersReducedMotion

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const bgY = useTransform(scrollYProgress, [0, 1], [-60, 60])
  const bgScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 0.95])

  useGSAP(
    () => {
      if (useStaticCards || !sectionRef.current || !stackRef.current) return undefined

      const cards = cardsRef.current.filter(Boolean)
      if (!cards.length) return undefined

      const mm = gsap.matchMedia()

      mm.add('(min-width: 1024px)', () => {
        gsap.set(cards, {
          position: 'absolute',
          inset: 0,
          transformOrigin: 'center top',
          willChange: 'transform, opacity, filter',
        })

        cards.forEach((card, index) => {
          gsap.set(card, {
            zIndex: index + 1,
            y: index === 0 ? 0 : 140 + index * 18,
            scale: index === 0 ? 1 : 0.96,
            opacity: index === 0 ? 1 : 0,
            filter: index === 0 ? 'blur(0px)' : 'blur(10px)',
          })
        })

        const tl = gsap.timeline({
          defaults: { ease: 'power2.out' },
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.75,
            invalidateOnRefresh: true,
          },
        })

        for (let activeIndex = 1; activeIndex < cards.length; activeIndex += 1) {
          const position = activeIndex - 1

          cards.slice(0, activeIndex).forEach((card, previousIndex) => {
            const depth = activeIndex - previousIndex

            tl.to(
              card,
              {
                y: -depth * 18,
                scale: Math.max(0.86, 1 - depth * 0.045),
                opacity: Math.max(0.45, 0.84 - depth * 0.08),
                filter: `blur(${Math.min(depth * 1.5, 5)}px)`,
                duration: 1,
              },
              position
            )
          })

          tl.to(
            cards[activeIndex],
            {
              y: activeIndex * 12,
              scale: 1,
              opacity: 1,
              filter: 'blur(0px)',
              duration: 1,
            },
            position
          )
        }

        ScrollTrigger.refresh()

        return () => {
          tl.scrollTrigger?.kill()
          tl.kill()
          gsap.set(cards, { clearProps: 'all' })
        }
      })

      return () => mm.revert()
    },
    { dependencies: [useStaticCards], scope: sectionRef }
  )

  return (
    <section
      id="features"
      ref={sectionRef}
      className="landing-reveal relative overflow-hidden px-4 py-24 lg:py-28"
      style={{ minHeight: useStaticCards ? undefined : `${features.length * 80}vh` }}
    >
      {/* Scroll-zoom background blob */}
      <motion.div
        style={{ y: bgY, scale: bgScale }}
        className="absolute inset-0 pointer-events-none flex items-center justify-center"
      >
        <div style={{ width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(240,165,0,0.06) 0%, transparent 70%)' }} />
      </motion.div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Title */}
        <div ref={titleRef} className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={titleInView ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="inline-block text-xs font-bold uppercase tracking-[0.15em] mb-4 px-4 py-1.5 rounded-full"
            style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
          >
            Everything you need
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={titleInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mb-4"
            style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', lineHeight: 1.1 }}
          >
            Built for music lovers,{' '}
            <motion.em
              initial={{ opacity: 0, x: -20 }}
              animate={titleInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.35, duration: 0.6 }}
            >
              by music lovers.
            </motion.em>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="text-lg max-w-xl mx-auto" style={{ color: 'var(--text-2)' }}
          >
            Every feature was designed to get out of the way and let you enjoy the music.
          </motion.p>
        </div>

        {useStaticCards ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {features.map((f, i) => (
              <FeatureCard key={f.title} feature={f} index={i} mode="static" />
            ))}
          </div>
        ) : (
          <div className="sticky top-20 mx-auto flex min-h-[620px] max-w-5xl items-center justify-center">
            <div ref={stackRef} className="relative h-[520px] w-full max-w-4xl">
              {features.map((f, i) => (
                <FeatureCard
                  key={f.title}
                  feature={f}
                  index={i}
                  mode="stack"
                  setRef={(node) => {
                    if (node) cardsRef.current[i] = node
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function FeatureCard({
  feature: f,
  index: i,
  mode = 'static',
  setRef,
}: {
  feature: typeof features[0],
  index: number,
  mode?: 'static' | 'stack',
  setRef?: (node: HTMLDivElement | null) => void,
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const isStack = mode === 'stack'

  return (
    <motion.div
      ref={(node) => {
        ref.current = node
        setRef?.(node)
      }}
      initial={isStack ? false : { opacity: 0, y: 44, scale: 0.96 }}
      animate={isStack ? undefined : inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ delay: i * 0.08, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      whileHover={isStack ? undefined : { y: -6, scale: 1.01 }}
      whileTap={isStack ? undefined : { scale: 0.98 }}
      className={`relative overflow-hidden rounded-[28px] border p-6 ${isStack ? 'cursor-default p-8 md:p-10' : 'cursor-pointer'}`}
      style={{
        background: 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--line)',
        boxShadow: isStack ? '0 30px 90px rgba(31,23,9,0.16)' : '0 18px 46px rgba(31,23,9,0.08)',
        transformStyle: 'preserve-3d',
        transition: 'box-shadow 0.3s ease',
        minHeight: isStack ? '520px' : undefined,
        display: isStack ? 'flex' : undefined,
        flexDirection: isStack ? 'column' : undefined,
        justifyContent: isStack ? 'center' : undefined,
      }}
    >
      {/* Shine sweep on hover */}
      <motion.div
        initial={{ x: '-100%', opacity: 0 }}
        whileHover={{ x: '200%', opacity: 0.15 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(105deg, transparent 40%, white 50%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        className={`${isStack ? 'mb-8 h-16 w-16 rounded-[22px]' : 'mb-5 h-12 w-12 rounded-2xl'} flex items-center justify-center text-2xl`}
        style={{ background: f.color }}
        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
        transition={{ duration: 0.5 }}
      >
        <SvgIcon name={f.icon} size={isStack ? 30 : 24} />
      </motion.div>

      <span className="absolute top-5 right-5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
        style={{ background: 'var(--surface-3)', color: 'var(--text-3)' }}>
        {f.tag}
      </span>

      <h3
        className={`${isStack ? 'mb-5 text-4xl md:text-5xl' : 'mb-2 text-lg'} font-bold`}
        style={{ color: 'var(--text)', fontFamily: isStack ? 'var(--serif)' : undefined, lineHeight: 1.05 }}
      >
        {f.title}
      </h3>
      <p className={`${isStack ? 'max-w-2xl text-lg leading-8' : 'text-sm leading-relaxed'}`} style={{ color: 'var(--text-2)' }}>
        {f.desc}
      </p>
    </motion.div>
  )
}
