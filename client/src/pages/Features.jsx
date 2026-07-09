import { motion } from 'framer-motion'
import { pageVariants, listItemVariants } from '../lib/animations'
import { useReducedMotion } from '../lib/animation-utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import IconBadge, { SvgIcon } from '../components/IconBadge'

export default function Features() {
  const prefersReducedMotion = useReducedMotion()

  const features = [
    {
      icon: 'music',
      title: 'Extensive Music Library',
      description: 'Access thousands of songs across all genres and moods'
    },
    {
      icon: 'heart',
      title: 'Personalized Favorites',
      description: 'Like and save your favorite tracks for quick access'
    },
    {
      icon: 'listMusic',
      title: 'Curated Playlists',
      description: 'Create and manage your own custom playlists'
    },
    {
      icon: 'search',
      title: 'Advanced Search',
      description: 'Find songs by title, artist, album, or mood'
    },
    {
      icon: 'cloud',
      title: 'Cloud Sync',
      description: 'Your library syncs across all your devices'
    },
    {
      icon: 'palette',
      title: 'Beautiful UI',
      description: 'Clean, minimal interface designed for focus'
    },
    {
      icon: 'moon',
      title: 'Dark Mode',
      description: 'Easy on the eyes with full dark mode support'
    },
    {
      icon: 'zap',
      title: 'Fast & Responsive',
      description: 'Lightning-quick performance and smooth interactions'
    }
  ]

  return (
    <motion.div
      variants={prefersReducedMotion ? {} : pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen pt-32 pb-20 px-4" style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Features</h1>
          <p className="text-xl text-[var(--text-2)] max-w-2xl mx-auto">
            Discover what makes Symponify the perfect music companion
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={{
            animate: { transition: { staggerChildren: 0.1 } }
          }}
        >
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={prefersReducedMotion ? {} : listItemVariants}
            >
              <Card className="h-full bg-[var(--surface-2)] border-[var(--line)] hover:bg-white/10 transition-colors">
                <CardHeader>
                  <IconBadge name={feature.icon} size={24} className="mb-4" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-20 p-8 rounded-2xl bg-gradient-to-r from-accent/20 to-accent/5 border border-accent/20"
        >
          <h2 className="text-3xl font-bold mb-4">Coming Soon</h2>
          <ul className="space-y-3 text-lg text-[var(--text-2)]">
            {['Collaborative playlists with friends', 'Podcast integration', 'Advanced audio filters and EQ', 'Social features and sharing'].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <SvgIcon name="sparkles" size={18} style={{ color: 'var(--accent)', marginTop: 4, flexShrink: 0 }} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </motion.div>
  )
}
