import { motion } from 'framer-motion'

export default function IntroVideo() {
  return (
    <section id="intro-video" className="relative px-4 py-20 overflow-hidden">
      <div className="w-full max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 text-center"
        >
          <p className="mb-3 font-mono text-xs tracking-widest uppercase" style={{ color: 'var(--accent)' }}>
            Intro video
          </p>
          <h2
            className="text-4xl md:text-5xl"
            style={{ fontFamily: 'var(--serif)', color: 'var(--text)' }}
          >
            Meet Symponify
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ delay: 0.1, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-lg border p-2"
          style={{
            borderColor: 'var(--line)',
            background: 'rgba(255,255,255,0.58)',
            boxShadow: 'var(--shadow)',
            backdropFilter: 'blur(14px)',
          }}
        >
          <video
            className="w-full rounded-md"
            controls
            preload="metadata"
            playsInline
          >
            <source src="/videos/smyponify.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </motion.div>
      </div>
    </section>
  )
}
