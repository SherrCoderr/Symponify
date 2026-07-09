import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SvgIcon } from '../components/IconBadge'
import PlayerMockup from './Playermockup'

const letterVariants = {
  hidden: { opacity: 0, y: 60, rotateX: -40 },
  show: (i: number) => ({
    opacity: 1, y: 0, rotateX: 0,
    transition: { delay: i * 0.04, duration: 0.7, ease: [0.22, 1, 0.36, 1] }
  }),
}

const words = ['Your', 'music,']
const gradientWords = ['everywhere.']

type AnalyticsStats = {
  totalVisits?: number
  totalListeners?: number
  totalUsers?: number
  totalSongs?: number
  totalAlbums?: number
}

const pluralize = (count: number, singular: string, plural = `${singular}s`) => (
  `${count} ${count === 1 ? singular : plural}`
)

const getLiveStatCopy = (stats: AnalyticsStats | null, loading: boolean) => {
  if (loading) {
    return {
      primary: 'Growing listener community',
      secondary: 'Fetching live app stats',
    }
  }

  if (!stats) {
    return {
      primary: 'Built for smooth music discovery',
      secondary: 'No personal tracking, just aggregate app metrics',
    }
  }

  const totalVisits = Number(stats.totalVisits) || 0
  const totalSongs = Number(stats.totalSongs) || 0
  const totalAlbums = Number(stats.totalAlbums) || 0

  let primary = 'Built for smooth music discovery'

  if (totalVisits >= 100) {
    primary = `${Math.floor(totalVisits / 100) * 100}+ visits since launch`
  } else if (totalVisits >= 10) {
    primary = `${Math.floor(totalVisits / 10) * 10}+ visits since launch`
  } else if (totalSongs > 0) {
    primary = `${pluralize(totalSongs, 'track')} available`
  } else if (totalVisits > 0) {
    primary = 'New listeners joining soon'
  }

  let secondary = 'Live aggregate stats, no personal tracking'
  if (totalSongs > 0 && !primary.includes('track')) {
    secondary = `${pluralize(totalSongs, 'track')} available`
  } else if (totalAlbums > 0) {
    secondary = `${pluralize(totalAlbums, 'album')} in the catalog`
  }

  return { primary, secondary }
}

export default function HeroSection({ analyticsStats = null, analyticsLoading = false }: { analyticsStats?: AnalyticsStats | null, analyticsLoading?: boolean }) {
  const navigate = useNavigate()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const liveStat = getLiveStatCopy(analyticsStats, analyticsLoading)

  // Scroll-linked transforms
  const y = useTransform(scrollYProgress, [0, 1], [0, 180])
  const scale = useTransform(scrollYProgress, [0, 0.6], [1, 0.88])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const playerY = useTransform(scrollYProgress, [0, 1], [0, -80])
  const playerScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.06])

  const springY = useSpring(y, { stiffness: 60, damping: 20 })
  const springScale = useSpring(scale, { stiffness: 60, damping: 20 })

  return (
    <section id="hero" ref={ref} className="landing-reveal relative flex flex-col items-center justify-center min-h-screen px-4 pb-20 overflow-hidden pt-28">
      {/* Background zoom ring */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ y: springY }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div style={{
          width: 900, height: 900, borderRadius: '50%',
          border: '1px solid rgba(255,92,53,0.08)',
          position: 'absolute',
        }} />
        <div style={{
          width: 650, height: 650, borderRadius: '50%',
          border: '1px solid rgba(255,92,53,0.12)',
          position: 'absolute',
        }} />
        <div style={{
          width: 400, height: 400, borderRadius: '50%',
          border: '1px solid rgba(255,92,53,0.18)',
          position: 'absolute',
        }} />
      </motion.div>

      <motion.div
        style={{ scale: springScale, opacity }}
        className="relative grid items-center w-full max-w-6xl grid-cols-1 gap-16 mx-auto lg:grid-cols-2"
      >
        {/* Left: copy */}
        <div className="flex flex-col items-start">
          <motion.div
            initial={{ opacity: 0, x: -40, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <Badge
              className="mb-6 inline-flex items-center gap-2 rounded-full text-xs font-semibold px-4 py-1.5 border-0"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
            >
              <SvgIcon name="music" size={14} /> Now in public beta
            </Badge>
          </motion.div>

          {/* Animated headline */}
          <div
            className="leading-[1.08] mb-6 overflow-hidden"
            style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(3rem, 6vw, 5.5rem)', color: 'var(--text)', perspective: '600px' }}
          >
            <div className="flex flex-wrap gap-x-4">
              {words.map((word, wi) => (
                <motion.span
                  key={word}
                  custom={wi}
                  variants={letterVariants}
                  initial="hidden"
                  animate="show"
                  style={{ display: 'inline-block' }}
                >
                  {word}
                </motion.span>
              ))}
            </div>
            <div className="flex flex-wrap gap-x-4">
              {gradientWords.map((word, wi) => (
                <motion.span
                  key={word}
                  custom={wi + words.length}
                  variants={letterVariants}
                  initial="hidden"
                  animate="show"
                  style={{
                    display: 'inline-block',
                    background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </div>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-md mb-8 text-lg leading-relaxed"
            style={{ color: 'var(--text-2)' }}
          >
            Symponify is a streaming platform that brings your music library to life — with a beautiful player, smart search, and a curated listening experience.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap gap-3 mb-10"
          >
            <MagneticButton>
              <Button
                onClick={() => navigate('/login')}
                size="lg"
                className="h-12 px-8 text-base font-bold text-white rounded-full"
                style={{ background: 'linear-gradient(135deg, var(--accent), #e04a25)', boxShadow: '0 8px 24px rgba(255,92,53,0.35)', border: 'none' }}
              >
                Get started free →
              </Button>
            </MagneticButton>
            <MagneticButton>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base font-semibold rounded-full cursor-pointer"
                onClick={() => {
                  localStorage.setItem('guestAccess', 'true')
                  window.dispatchEvent(new Event('authchange'))
                  navigate('/home')
                }}
                style={{ border: '1.5px solid var(--line)', color: 'var(--text)', background: 'rgba(255,255,255,0.7)' }}
              >
                Live demo
              </Button>
            </MagneticButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.7 }}
            className="flex items-center gap-4"
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
              aria-hidden="true"
            >
              <SvgIcon name="music" size={18} />
            </div>
            <div>
              <p className="text-sm" style={{ color: 'var(--text-2)' }}>
                <strong style={{ color: 'var(--text)' }}>{liveStat.primary}</strong>
              </p>
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                {liveStat.secondary}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right: player with parallax */}
        <motion.div
          style={{ y: playerY, scale: playerScale }}
          className="flex justify-center lg:justify-end"
        >
          <PlayerMockup />
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        style={{ opacity }}
        className="absolute flex flex-col items-center gap-2 -translate-x-1/2 bottom-8 left-1/2"
      >
        <span className="font-mono text-xs tracking-widest uppercase" style={{ color: 'var(--text-3)' }}>Scroll</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
          style={{ color: 'var(--text-3)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
        </motion.div>
      </motion.div>
    </section>
  )
}

// Magnetic button effect
function MagneticButton({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    ref.current.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`
  }

  const handleMouseLeave = () => {
    if (ref.current) ref.current.style.transform = ''
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1)', display: 'inline-block' }}
    >
      {children}
    </div>
  )
}

