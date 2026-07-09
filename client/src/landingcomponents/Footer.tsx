import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Waveform from './Waveform'
import useViewport from '../hooks/useViewport'

const links = {
  Product: [
    { label: 'Features', path: '/features' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'Changelog', path: '/changelog' },
    { label: 'Roadmap', path: '/roadmap' }
  ],
  Developer: [
    { label: 'API Docs', path: '/api-docs' },
    { label: 'GitHub', path: 'https://github.com/symponify', external: true },
    { label: 'Self-host guide', path: '/self-host' },
    { label: 'Status', path: '/status' }
  ],
  Company: [
    { label: 'About', path: '/about' },
    { label: 'Blog', path: '/blog' },
    { label: 'Careers', path: '/careers' },
    { label: 'Contact', path: '/contact' }
  ],
  Legal: [
    { label: 'Privacy', path: '/privacy' },
    { label: 'Terms', path: '/terms' },
    { label: 'Cookie policy', path: '/cookie-policy' }
  ]
}

const mobileLinks = {
  Product: [
    { label: 'Features', path: '/features' },
    { label: 'Roadmap', path: '/roadmap' },
  ],
  Company: [
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ],
  Legal: [
    { label: 'Privacy', path: '/privacy' },
    { label: 'Terms', path: '/terms' },
  ],
}

export default function Footer() {
  const navigate = useNavigate()
  const { isTabletOrBelow } = useViewport()
  const [feedback, setFeedback] = useState({ name: '', email: '', description: '' })
  const [status, setStatus] = useState({ loading: false, success: false, error: '' })
  const [openSection, setOpenSection] = useState('Product')

  const handleNavigation = (path, external) => {
    if (external) {
      window.open(path, '_blank')
    } else {
      navigate(path)
    }
  }

  const submitFeedback = async (e) => {
    e.preventDefault()
    if (!feedback.name || !feedback.email || !feedback.description) {
      setStatus({ ...status, error: 'Please fill all fields' })
      return
    }

    try {
      setStatus({ loading: true, success: false, error: '' })
      
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
      const response = await fetch(`${API_BASE}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedback),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit feedback')
      }

      setStatus({ loading: false, success: true, error: '' })
      setFeedback({ name: '', email: '', description: '' })
      
      setTimeout(() => {
        setStatus(s => ({ ...s, success: false }))
      }, 5000)
    } catch (err) {
      setStatus({ loading: false, success: false, error: err.message })
    }
  }

  if (isTabletOrBelow) {
    return (
      <footer
        id="footer"
        className="landing-reveal px-4 py-8"
        style={{ borderTop: '1px solid var(--line)', background: 'var(--bg)' }}
      >
        <div className="mx-auto w-full max-w-xl">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mb-3 flex min-h-11 items-center gap-2.5 text-left transition-opacity hover:opacity-70"
          >
            <span
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
            >
              <WaveIcon />
            </span>
            <span style={{ fontFamily: 'var(--serif)', fontSize: '24px', color: 'var(--text)' }}>Symponify</span>
          </button>

          <p className="mb-5 text-sm leading-6" style={{ color: 'var(--text-2)' }}>
            A smooth music experience for every listener.
          </p>

          <div className="overflow-hidden rounded-2xl border" style={{ borderColor: 'var(--line)', background: 'rgba(255,255,255,0.58)' }}>
            {Object.entries(mobileLinks).map(([category, items], index) => {
              const isOpen = openSection === category

              return (
                <div key={category} style={{ borderTop: index === 0 ? 'none' : '1px solid var(--line)' }}>
                  <button
                    type="button"
                    className="flex min-h-12 w-full items-center justify-between px-4 py-3 text-left text-sm font-bold"
                    style={{ color: 'var(--text)' }}
                    aria-expanded={isOpen}
                    onClick={() => setOpenSection(isOpen ? '' : category)}
                  >
                    {category}
                    <span
                      aria-hidden="true"
                      className="text-lg leading-none transition-transform duration-200"
                      style={{ color: 'var(--text-3)', transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
                    >
                      +
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden px-4 pb-3"
                      >
                        {items.map((item) => (
                          <li key={item.label}>
                            <button
                              type="button"
                              onClick={() => handleNavigation(item.path, item.external)}
                              className="min-h-10 py-1 text-left text-sm transition-opacity hover:opacity-70"
                              style={{ color: 'var(--text-2)' }}
                            >
                              {item.label}
                            </button>
                          </li>
                        ))}
                      </motion.ul>
                    ) : null}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>

          <p className="mt-5 text-xs leading-5" style={{ color: 'var(--text-3)' }}>
            © 2026 Symponify. Built with care.
          </p>
        </div>
      </footer>
    )
  }

  return (
    <footer id="footer" className="landing-reveal py-16 px-4" style={{ borderTop: '1px solid var(--line)', background: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-8 gap-8 mb-14">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <button onClick={() => navigate('/')} className="flex items-center gap-2.5 mb-4 hover:opacity-70 transition-opacity">
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
              >
                <WaveIcon />
              </span>
              <span style={{ fontFamily: 'var(--serif)', fontSize: '22px' }}>Symponify</span>
            </button>
            <p className="text-sm max-w-xs mb-6 leading-relaxed" style={{ color: 'var(--text-2)' }}>
              A full-stack music streaming platform built with React, Express, MongoDB, and Cloudinary. Open-source at heart.
            </p>
            {/* Mini waveform */}
            <div className="max-w-[180px]">
              <Waveform barCount={24} height={28} color="var(--accent)" playing />
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <p
                className="text-xs font-bold uppercase tracking-[0.12em] mb-4"
                style={{ color: 'var(--text-3)' }}
              >
                {category}
              </p>
              <ul className="flex flex-col gap-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <button
                      onClick={() => handleNavigation(item.path, item.external)}
                      className="text-sm hover:opacity-70 transition-opacity text-left"
                      style={{ color: 'var(--text-2)' }}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Feedback Form */}
          <div className="lg:col-span-2">
            <p className="text-xs font-bold uppercase tracking-[0.12em] mb-4" style={{ color: 'var(--text-3)' }}>
              Send Feedback
            </p>
            <form onSubmit={submitFeedback} className="flex flex-col gap-3">
              {status.success && (
                <div className="p-3 text-sm rounded-lg" style={{ background: '#f0fff4', color: '#166534', border: '1px solid #86efac' }}>
                  Thank you! Your feedback has been sent.
                </div>
              )}
              {status.error && (
                <div className="p-3 text-sm rounded-lg" style={{ background: '#fff5f5', color: '#991b1b', border: '1px solid #fca5a5' }}>
                  {status.error}
                </div>
              )}
              
              <input 
                type="text" 
                placeholder="Name" 
                className="p-3 rounded-lg text-sm outline-none w-full"
                style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--line)' }}
                value={feedback.name}
                onChange={e => setFeedback({...feedback, name: e.target.value})}
                required
              />
              <input 
                type="email" 
                placeholder="Email address" 
                className="p-3 rounded-lg text-sm outline-none w-full"
                style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--line)' }}
                value={feedback.email}
                onChange={e => setFeedback({...feedback, email: e.target.value})}
                required
              />
              <textarea 
                placeholder="What can we improve?" 
                className="p-3 rounded-lg text-sm outline-none w-full resize-none h-24"
                style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--line)' }}
                value={feedback.description}
                onChange={e => setFeedback({...feedback, description: e.target.value})}
                required
              />
              <button 
                type="submit" 
                disabled={status.loading}
                className="py-3 px-4 rounded-lg text-white text-sm font-bold w-full transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', opacity: status.loading ? 0.7 : 1 }}
              >
                {status.loading ? 'Sending...' : 'Submit Feedback'}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8"
          style={{ borderTop: '1px solid var(--line)' }}
        >
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>
            © 2026 Symponify. Built with care and too many late nights.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/symponify"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm transition-opacity hover:opacity-70"
              style={{ color: 'var(--text-3)' }}
            >
              GitHub
            </a>
            <a href="#" className="text-sm transition-opacity hover:opacity-70" style={{ color: 'var(--text-3)' }}>
              Twitter
            </a>
            <a href="#" className="text-sm transition-opacity hover:opacity-70" style={{ color: 'var(--text-3)' }}>
              Discord
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

function WaveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M1 8 Q3 4 5 8 Q7 12 9 8 Q11 4 13 8 Q15 12 15 8"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
