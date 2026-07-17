const router = require('express').Router()
const Analytics = require('../models/Analytics')
const Album = require('../models/Album')
const Song = require('../models/Song')
const User = require('../models/User')
const { sendError } = require('../utils/http')

const ANALYTICS_KEY = 'site'

const getAnalyticsDoc = () =>
  Analytics.findOneAndUpdate(
    { key: ANALYTICS_KEY },
    { $setOnInsert: { key: ANALYTICS_KEY, totalVisits: 0 } },
    { upsert: true, new: true }
  )

const getTotalAlbums = async () => {
  const [storedAlbums, songAlbums] = await Promise.all([
    Album.find({}).select('title').lean(),
    Song.distinct('album', { album: { $ne: '' } }),
  ])

  const albumTitles = new Set()
  storedAlbums.forEach((album) => {
    if (album.title) albumTitles.add(album.title)
  })
  songAlbums.forEach((title) => {
    if (title) albumTitles.add(title)
  })

  return albumTitles.size
}

router.post('/visit', async (_req, res) => {
  try {
    const analytics = await Analytics.findOneAndUpdate(
      { key: ANALYTICS_KEY },
      {
        $inc: { totalVisits: 1 },
        $set: { lastVisitAt: new Date() },
        $setOnInsert: { key: ANALYTICS_KEY },
      },
      { upsert: true, new: true }
    ).lean()

    res.status(201).json({ totalVisits: analytics.totalVisits })
  } catch (error) {
    sendError(res, error, 'Unable to record visit.')
  }
})

router.get('/stats', async (_req, res) => {
  try {
    const [analytics, totalUsers, totalSongs, totalAlbums] = await Promise.all([
      getAnalyticsDoc().lean(),
      User.countDocuments({}),
      Song.countDocuments({}),
      getTotalAlbums(),
    ])

    res.json({
      totalVisits: analytics.totalVisits || 0,
      totalListeners: totalUsers,
      totalUsers,
      totalSongs,
      totalAlbums,
    })
  } catch (error) {
    sendError(res, error, 'Unable to load analytics stats.')
  }
})

module.exports = router
