const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
require('dotenv').config()

const connectDB = require('./config/db')

const path = require('path')
const app = express()
app.set('trust proxy', 1)

const isProduction = process.env.NODE_ENV === 'production'

const normalizeOrigin = (origin = '') => origin.trim().replace(/\/+$/, '')

const configuredOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map(normalizeOrigin)
  .filter(Boolean)

const developmentOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
]

const allowedOrigins = new Set([
  ...configuredOrigins,
  ...(!isProduction ? developmentOrigins : []),
])

const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isProduction ? 300 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again shortly.' },
})

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isProduction ? 10 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again shortly.' },
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isProduction ? 60 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many auth requests. Please try again shortly.' },
})

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isProduction ? 20 : 80,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many upload requests. Please try again shortly.' },
})

app.use(
  cors({
    origin: (origin, callback) => {
      const normalizedOrigin = origin ? normalizeOrigin(origin) : ''
      if (!origin || allowedOrigins.has(normalizedOrigin)) {
        callback(null, true)
        return
      }

      console.warn(`[CORS] Blocked origin: ${origin}`)
      const error = new Error('CORS blocked for this origin')
      error.status = 403
      callback(error)
    },
    credentials: true,
  })
)

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  })
)

if (!isProduction) {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`)
    next()
  })
}

app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))

app.get('/', (_req, res) => {
  res.send('Symponify Backend Running')
})

// Local media is a development/legacy fallback. Production defaults to Cloudinary-only delivery.
if (!isProduction || process.env.ALLOW_LEGACY_LOCAL_MEDIA === 'true') {
  app.use('/songs', express.static(path.join(__dirname, 'public', 'songs')))
}

app.get('/api/health', (_req, res) => {
  const databaseReady = require('mongoose').connection.readyState === 1
  res.status(databaseReady ? 200 : 503).json({
    ok: databaseReady,
    database: databaseReady ? 'connected' : 'unavailable',
    uptime: process.uptime(),
  })
})

app.post('/api/auth/login', loginLimiter)
app.post('/api/auth/admin-access', loginLimiter)
app.use('/api/auth', authLimiter, require('./routes/auth'))
app.post('/api/songs/upload', uploadLimiter)
app.put('/api/songs/:id/media', uploadLimiter)
app.post('/api/songs/albums/:album/cover', uploadLimiter)
app.post('/api/songs/albums', uploadLimiter)
app.use('/api/songs', publicLimiter)
app.use('/api/playlists', publicLimiter)
app.use('/api/feedback', publicLimiter)
app.use('/api/analytics', publicLimiter)
app.use('/api/songs', require('./routes/songs'))
app.use('/api/playlists', require('./routes/playlists'))
app.use('/api/feedback', require('./routes/feedback'))
app.use('/api/analytics', require('./routes/analytics'))

app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found.' })
})

app.use((err, _req, res, _next) => {
  const status = err.status || err.statusCode || (err.name === 'MulterError' || err.type === 'entity.parse.failed' ? 400 : 500)
  const message = status >= 500 ? 'Internal server error' : err.message || 'Request failed.'
  if (status >= 500) console.error(err)
  res.status(status).json({ message })
})

const PORT = process.env.PORT || 5000

const validateProductionConfig = () => {
  if (!isProduction) return

  const required = [
    'MONGO_URI',
    'JWT_SECRET',
    'CLIENT_ORIGIN',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'ADMIN_EMAIL',
    'ADMIN_PASSWORD',
  ]
  const missing = required.filter((name) => !process.env[name])
  if (missing.length) {
    throw new Error(`Missing required production environment variables: ${missing.join(', ')}`)
  }

  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production')
  }

  if (process.env.ADMIN_PASSWORD.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters in production')
  }
}

const startServer = async () => {
  validateProductionConfig()
  await connectDB()

  const server = app.listen(PORT, () => {
    console.log(`Symponify server running on port ${PORT}`)
  })

  const shutdown = (signal) => {
    console.log(`${signal} received. Closing HTTP server.`)
    server.close(() => process.exit(0))
  }

  process.once('SIGTERM', () => shutdown('SIGTERM'))
  process.once('SIGINT', () => shutdown('SIGINT'))
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Server startup failed:', error.message)
    process.exit(1)
  })
}

module.exports = { app, startServer }
