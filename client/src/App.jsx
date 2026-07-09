import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './components/MainLayout'
import MobileOnboarding from './components/MobileOnboarding'
import AddSong from './pages/AddSong'
import Home from './pages/Home'
import Library from './pages/Library'
import LikedSongs from './pages/LikedSongs'
import ManageSongs from './pages/ManageSongs'
import Login from './pages/Login'
import Search from './pages/Search'
import Lyrics from './pages/Lyrics'
import LanApp from './pages/LanApp'
import Features from './pages/Features'
import Pricing from './pages/Pricing'
import Changelog from './pages/Changelog'
import Roadmap from './pages/Roadmap'
import ApiDocs from './pages/ApiDocs'
import About from './pages/About'
import Blog from './pages/Blog'
import Status from './pages/Status'
import Contact from './pages/Contact'
import Careers from './pages/Careers'
import FAQ from './pages/FAQ'
import SelfHost from './pages/SelfHost'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import CookiePolicy from './pages/CookiePolicy'

const ONBOARDING_STORAGE_KEY = 'symponify_onboarding_seen'
const MOBILE_ONBOARDING_QUERY = '(max-width: 1023px)'

const hasSeenOnboarding = () => {
  try {
    return localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

const getShouldUseMobileOnboarding = () => (
  typeof window !== 'undefined' && window.matchMedia(MOBILE_ONBOARDING_QUERY).matches
)

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(localStorage.getItem('token')))
  const [isGuest, setIsGuest] = useState(localStorage.getItem('guestAccess') === 'true')
  const [isMobileOnboardingViewport, setIsMobileOnboardingViewport] = useState(getShouldUseMobileOnboarding)
  const [showOnboarding, setShowOnboarding] = useState(() => getShouldUseMobileOnboarding() && !hasSeenOnboarding())
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      return Boolean(JSON.parse(localStorage.getItem('user') || 'null')?.isAdmin)
    } catch {
      return false
    }
  })

  useEffect(() => {
    const syncAuth = () => {
      setIsLoggedIn(Boolean(localStorage.getItem('token')))
      setIsGuest(localStorage.getItem('guestAccess') === 'true')
      try {
        setIsAdmin(Boolean(JSON.parse(localStorage.getItem('user') || 'null')?.isAdmin))
      } catch {
        setIsAdmin(false)
      }
    }

    window.addEventListener('storage', syncAuth)
    window.addEventListener('authchange', syncAuth)

    return () => {
      window.removeEventListener('storage', syncAuth)
      window.removeEventListener('authchange', syncAuth)
    }
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_ONBOARDING_QUERY)

    const syncViewport = () => {
      const isMobileViewport = mediaQuery.matches
      setIsMobileOnboardingViewport(isMobileViewport)
      setShowOnboarding(isMobileViewport && !hasSeenOnboarding())
    }

    syncViewport()
    mediaQuery.addEventListener('change', syncViewport)

    return () => mediaQuery.removeEventListener('change', syncViewport)
  }, [])

  const completeOnboarding = () => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true')
    } catch {
      // If storage is unavailable, let the current session continue.
    }
    setShowOnboarding(false)
  }

  const canAccessApp = isLoggedIn || isGuest

  if (isMobileOnboardingViewport && showOnboarding) {
    return <MobileOnboarding onComplete={completeOnboarding} />
  }

  return (
    <Routes>
      {/* Landing page */}
      <Route path="/" element={canAccessApp ? <Navigate to="/home" replace /> : <LanApp />} />
      
      {/* Public info pages */}
      <Route path="/features" element={<Features />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/changelog" element={<Changelog />} />
      <Route path="/roadmap" element={<Roadmap />} />
      <Route path="/api-docs" element={<ApiDocs />} />
      <Route path="/about" element={<About />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/status" element={<Status />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/careers" element={<Careers />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/self-host" element={<SelfHost />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/cookie-policy" element={<CookiePolicy />} />

      {/* Auth */}
      <Route path="/login" element={canAccessApp ? <Navigate to="/home" replace /> : <Login />} />

      {/* App routes */}
      {canAccessApp ? (
        <Route path="/home" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="add-song" element={isAdmin ? <AddSong /> : <Navigate to="/home" replace />} />
          <Route path="manage-songs" element={isAdmin ? <ManageSongs /> : <Navigate to="/home" replace />} />
          <Route path="liked" element={<LikedSongs />} />
          <Route path="search" element={<Search />} />
          <Route path="library" element={<Library />} />
          <Route path="lyrics" element={<Lyrics />} />
        </Route>
      ) : null}

      {/* Catch all */}
      <Route path="*" element={<Navigate to={canAccessApp ? '/home' : '/'} replace />} />
    </Routes>
  )
}

export default App
