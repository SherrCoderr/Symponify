import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Waveform from './Waveform'
import { useReducedMotion } from '../lib/animation-utils'
import useViewport from '../hooks/useViewport'

const getInitialPreviewPlaying = () => (
  typeof window === 'undefined' || !window.matchMedia('(prefers-reduced-motion: reduce)').matches
)

export default function PlayerMockup() {
  const prefersReducedMotion = useReducedMotion()
  const { isMobile, isTabletOrBelow } = useViewport()
  const previewVideoRef = useRef<HTMLVideoElement | null>(null)
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(getInitialPreviewPlaying)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const playing = isPreviewPlaying

  useEffect(() => {
    const video = previewVideoRef.current
    if (!video) return

    if (prefersReducedMotion) {
      video.pause()
      setIsPreviewPlaying(false)
      return
    }

    const playPromise = video.play()
    if (playPromise) {
      playPromise
        .then(() => setIsPreviewPlaying(true))
        .catch(() => setIsPreviewPlaying(false))
    }
  }, [prefersReducedMotion])

  const progress = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0
  const togglePreviewPlayback = () => {
    const video = previewVideoRef.current
    if (!video) return

    if (isPreviewPlaying) {
      video.pause()
      setIsPreviewPlaying(false)
      return
    }

    const playPromise = video.play()
    if (playPromise) {
      playPromise
        .then(() => setIsPreviewPlaying(true))
        .catch(() => setIsPreviewPlaying(false))
    } else {
      setIsPreviewPlaying(true)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[32px] overflow-hidden select-none"
      style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--line)',
        boxShadow: '0 32px 80px rgba(31,23,9,0.14)',
        maxWidth: isMobile ? 360 : 420,
        width: 'min(100%, 420px)',
      }}
    >
      {/* Intro video artwork area */}
      <div className="relative overflow-hidden" style={{ height: isMobile ? 170 : isTabletOrBelow ? 190 : 220, background: 'linear-gradient(140deg, #190e2e, #43316b 60%, #ff5c35)' }}>
        <video
          ref={previewVideoRef}
          className="block h-full w-full"
          style={{ objectFit: 'cover', borderRadius: '32px 32px 0 0' }}
          autoPlay={!prefersReducedMotion}
          muted
          loop
          playsInline
          preload="metadata"
          controls={false}
          onPlay={() => setIsPreviewPlaying(true)}
          onPause={() => setIsPreviewPlaying(false)}
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime || 0)}
          onLoadedMetadata={(event) => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
          onError={() => setIsPreviewPlaying(false)}
        >
          <source src="/videos/symponify-intro.mp4" type="video/mp4" />
        </video>

        {/* Song info overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-6" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.45), transparent)' }}>
          <span className="mb-1 font-mono text-xs tracking-wider uppercase text-white/60">Product preview</span>
          <h3 className="text-xl font-bold leading-tight text-white">Meet Symponify</h3>
          <p className="text-white/75 text-sm mt-0.5">Intro video</p>
        </div>
      </div>

      {/* Controls */}
      <div className={isMobile ? 'p-4' : 'p-5'}>
        {/* Waveform */}
        <div className="mb-4">
          <Waveform barCount={isMobile ? 30 : 40} height={isMobile ? 38 : 48} playing={playing} color="var(--accent)" />
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs tabular-nums" style={{ color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>
            {formatTime(currentTime)}
          </span>
          <div
            className="relative flex-1 h-1 overflow-hidden rounded-full cursor-pointer"
            style={{ background: 'var(--surface-3)' }}
          >
            <motion.div
              className="absolute top-0 left-0 h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent-2))', width: `${progress}%` }}
              transition={{ duration: 0 }}
            />
          </div>
          <span className="text-xs tabular-nums" style={{ color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>
            {formatTime(duration)}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={togglePreviewPlayback}
            className="flex items-center justify-center text-white rounded-full w-14 h-14"
            style={{ background: 'linear-gradient(135deg, var(--accent), #e04a25)', boxShadow: '0 8px 24px rgba(255,92,53,0.4)' }}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

function formatTime(secs: number) {
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function PlayIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M5 3l14 9-14 9V3z"/></svg>
}
function PauseIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
}
