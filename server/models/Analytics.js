const mongoose = require('mongoose')

const AnalyticsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'site' },
    totalVisits: { type: Number, default: 0, min: 0 },
    lastVisitAt: { type: Date },
  },
  {
    timestamps: true,
    collection: 'Analytics_col',
  }
)

module.exports = mongoose.model('Analytics', AnalyticsSchema)
