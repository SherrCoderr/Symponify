import { useEffect, useRef, useState } from 'react'
import NavLan from '../landingcomponents/NavLan'
import HeroSection from '../landingcomponents/Herosection'
import FeaturesSection from '../landingcomponents/Featuresection'
import HowItWorks from '../landingcomponents/Howitworks'
import CtaSection from '../landingcomponents/Ctasection'
import Footer from '../landingcomponents/Footer'
import GsapAmbient from '../components/visuals/GsapAmbient'
import useSmoothScroll from '../hooks/useSmoothScroll'
import { analyticsService } from '../lib/services'

const LANDING_VISIT_SESSION_KEY = 'symponify_landing_visit_recorded'

const hasRecordedLandingVisit = () => {
  try {
    return sessionStorage.getItem(LANDING_VISIT_SESSION_KEY) === 'true'
  } catch {
    return false
  }
}

const markLandingVisitRecorded = () => {
  try {
    sessionStorage.setItem(LANDING_VISIT_SESSION_KEY, 'true')
  } catch {
    // Storage can be unavailable in restricted browser modes; analytics remains aggregate-only.
  }
}

export default function LanApp() {
  const landingRef = useRef(null)
  const { scrollToSection } = useSmoothScroll(landingRef)
  const [analyticsStats, setAnalyticsStats] = useState(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const loadAnalytics = async () => {
      try {
        if (!hasRecordedLandingVisit()) {
          await analyticsService.recordVisit()
          markLandingVisitRecorded()
        }

        const stats = await analyticsService.getStats()
        if (!cancelled) setAnalyticsStats(stats)
      } catch (error) {
        if (!cancelled) setAnalyticsStats(null)
      } finally {
        if (!cancelled) setAnalyticsLoading(false)
      }
    }

    loadAnalytics()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div ref={landingRef} className="landing-page relative isolate min-h-screen overflow-x-hidden bg-gradient-to-b from-[#f5f1eb] via-[#faf8f5] to-[#f5f1eb]" style={{ '--text': '#1f1817', '--text-2': '#6b6b6b', '--text-3': '#999999', '--accent': '#ff5c35', '--accent-2': '#f0a500', '--accent-soft': 'rgba(255, 92, 53, 0.1)', '--surface-3': 'rgba(0, 0, 0, 0.04)', '--line': 'rgba(0, 0, 0, 0.08)', '--shadow': '0 12px 32px rgba(31, 23, 9, 0.08)' }}>
      <GsapAmbient variant="landing" />
      <NavLan onSectionClick={scrollToSection} />
      <HeroSection analyticsStats={analyticsStats} analyticsLoading={analyticsLoading} />
      <FeaturesSection />
      <HowItWorks />
      <CtaSection />
      <Footer />
    </div>
  )
}
