const isProduction = process.env.NODE_ENV === 'production'

const sendError = (res, error, fallbackMessage = 'Request failed.', fallbackStatus = 500) => {
  const status = Number(error?.status || error?.statusCode || fallbackStatus)
  const safeStatus = status >= 400 && status <= 599 ? status : fallbackStatus
  const message = safeStatus >= 500 && isProduction
    ? fallbackMessage
    : error?.message || fallbackMessage

  if (safeStatus >= 500) {
    console.error(error)
  }

  return res.status(safeStatus).json({ message })
}

module.exports = { sendError }
