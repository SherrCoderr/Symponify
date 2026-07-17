import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from './ui/button'
import { useReducedMotion } from '../lib/animation-utils'
import discoverYourSoundImage from '../assets/onboarding/discover-your-sound.webp'
import browseCuratedPlaylistsImage from '../assets/onboarding/browse-curated-playlists.webp'
import startInstantlyImage from '../assets/onboarding/start-instantly.webp'

const slides = [
  {
    id: 'discover-your-sound',
    title: 'Discover your sound',
    description: 'Explore songs, albums, and playlists in one smooth music experience.',
    image: discoverYourSoundImage,
    width: 960,
    height: 536,
    alt: 'A listener using Symponify on a phone while wearing earbuds outdoors.',
  },
  {
    id: 'browse-curated-playlists',
    title: 'Browse curated playlists',
    description: 'Find handpicked mixes, favorites, and collections made for every mood.',
    image: browseCuratedPlaylistsImage,
    width: 960,
    height: 524,
    alt: 'A Symponify playlist hub shown on a phone beside a listener with earbuds.',
  },
  {
    id: 'start-instantly',
    title: 'Start instantly',
    description: 'Create an account or continue as a guest and begin listening right away.',
    image: startInstantlyImage,
    width: 960,
    height: 524,
    alt: 'A listener holding up a phone with the Symponify player ready to start.',
  },
]

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
    scale: 0.98,
  }),
}

export default function MobileOnboarding({ onComplete }) {
  const prefersReducedMotion = useReducedMotion()
  const [[index, direction], setSlide] = useState([0, 0])
  const activeSlide = slides[index]
  const isLastSlide = index === slides.length - 1

  useEffect(() => {
    const preloadRemainingSlides = () => {
      slides.slice(1).forEach(({ image }) => {
        const preload = new Image()
        preload.src = image
      })
    }

    if ('requestIdleCallback' in window) {
      const idleCallback = window.requestIdleCallback(preloadRemainingSlides)
      return () => window.cancelIdleCallback(idleCallback)
    }

    const timeout = window.setTimeout(preloadRemainingSlides, 250)
    return () => window.clearTimeout(timeout)
  }, [])

  const transition = useMemo(
    () => (
      prefersReducedMotion
        ? { duration: 0.01 }
        : { duration: 0.42, ease: [0.22, 1, 0.36, 1] }
    ),
    [prefersReducedMotion]
  )

  const goToSlide = (nextIndex) => {
    if (nextIndex < 0 || nextIndex >= slides.length || nextIndex === index) return
    setSlide([nextIndex, nextIndex > index ? 1 : -1])
  }

  const handleContinue = () => {
    if (isLastSlide) {
      onComplete()
      return
    }

    setSlide([index + 1, 1])
  }

  const handleDragEnd = (_event, info) => {
    if (prefersReducedMotion) return

    const swipeDistance = info.offset.x
    const swipeVelocity = info.velocity.x
    const shouldMove = Math.abs(swipeDistance) > 70 || Math.abs(swipeVelocity) > 450

    if (!shouldMove) return
    if (swipeDistance < 0 && index < slides.length - 1) setSlide([index + 1, 1])
    if (swipeDistance > 0 && index > 0) setSlide([index - 1, -1])
  }

  return (
    <main
      className="fixed inset-0 z-[100] flex min-h-dvh flex-col overflow-hidden bg-[#faf8f5] px-5 py-5 text-[#1f1817] sm:px-8"
      style={{
        paddingTop: 'max(1.25rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))',
      }}
      aria-labelledby="mobile-onboarding-title"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-18%] top-[-12%] h-64 w-64 rounded-full bg-[rgba(255,92,53,0.12)] blur-3xl" />
        <div className="absolute bottom-[-16%] right-[-20%] h-72 w-72 rounded-full bg-[rgba(240,165,0,0.12)] blur-3xl" />
      </div>

      <div className="relative z-10 flex items-center justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onComplete}
          className="rounded-full px-4 text-sm font-semibold text-[#6b6b6b]"
        >
          Skip
        </Button>
      </div>

      <section className="relative z-10 flex flex-1 items-center justify-center py-6">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.article
            key={activeSlide.id}
            custom={direction}
            variants={prefersReducedMotion ? {} : slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
            drag={prefersReducedMotion ? false : 'x'}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.12}
            onDragEnd={handleDragEnd}
            className="w-full max-w-md touch-pan-y"
          >
            <div className="relative overflow-hidden rounded-[2rem] border border-[rgba(31,24,23,0.08)] bg-white/80 p-4 text-center shadow-[0_28px_80px_rgba(31,23,9,0.13)] backdrop-blur-xl sm:p-6">
              <div className="mb-6 overflow-hidden rounded-[1.5rem] border border-[rgba(31,24,23,0.08)] bg-[rgba(255,92,53,0.06)] p-1 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.55)]">
                <img
                  src={activeSlide.image}
                  alt={activeSlide.alt}
                  width={activeSlide.width}
                  height={activeSlide.height}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                  decoding="async"
                  className="w-full rounded-[1.25rem] object-cover object-center"
                  style={{ height: 'clamp(10rem, 31dvh, 15rem)' }}
                  draggable="false"
                />
              </div>

              <p className="mb-3 font-mono text-xs uppercase tracking-widest text-[#ff5c35]">
                {index + 1} / {slides.length}
              </p>
              <h1
                id="mobile-onboarding-title"
                className="mb-4 text-[clamp(2.35rem,11vw,3.5rem)] leading-[1.02]"
                style={{ fontFamily: 'var(--serif)' }}
              >
                {activeSlide.title}
              </h1>
              <p className="mx-auto max-w-xs text-base leading-7 text-[#6b6b6b]">
                {activeSlide.description}
              </p>
            </div>
          </motion.article>
        </AnimatePresence>
      </section>

      <div className="relative z-10 pb-2">
        <div className="mb-6 flex items-center justify-center gap-2" aria-label="Onboarding progress">
          {slides.map((slide, slideIndex) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Go to slide ${slideIndex + 1}`}
              aria-current={slideIndex === index ? 'step' : undefined}
              onClick={() => goToSlide(slideIndex)}
              className="flex h-8 w-8 items-center justify-center rounded-full"
            >
              <span
                className={`block h-2 rounded-full transition-[width,background-color] duration-300 ${
                  slideIndex === index ? 'w-7 bg-[#ff5c35]' : 'w-2 bg-[rgba(31,24,23,0.18)]'
                }`}
              />
            </button>
          ))}
        </div>

        <Button
          type="button"
          size="lg"
          onClick={handleContinue}
          className="h-14 w-full rounded-full text-base font-bold text-white shadow-[0_14px_32px_rgba(255,92,53,0.28)]"
          style={{ background: 'linear-gradient(135deg, #ff5c35, #e04a25)' }}
        >
          {isLastSlide ? 'Get Started' : 'Continue'}
        </Button>
      </div>
    </main>
  )
}
