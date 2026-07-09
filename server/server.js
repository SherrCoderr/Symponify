const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
require('dotenv').config()

const connectDB = require('./config/db')

const path = require('path')
const app = express()
connectDB()
app.set('trust proxy', 1)

const isProduction = process.env.NODE_ENV === 'production'

const normalizeOrigin = (origin = '') => origin.trim().replace(/\/+$/, '')

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'https://symponify-8tga.vercel.app',
  'https://symponify.vercel.app',
  ...(process.env.CLIENT_ORIGIN || '')
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean),
]

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
      if (!origin || allowedOrigins.includes(normalizedOrigin)) {
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

// Serve local media fallback for development: /songs/* -> server/public/songs/*
app.use('/songs', express.static(path.join(__dirname, 'public', 'songs')))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, uptime: process.uptime() })
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

app.listen(PORT, () => {
  console.log(`Symponify server running on port ${PORT}`)
})
