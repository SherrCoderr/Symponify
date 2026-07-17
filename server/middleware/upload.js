const path = require('path')
const fs = require('fs')
const multer = require('multer')
const { cloudinary, ensureCloudinaryConfigured, hasCloudinaryConfig } = require('../config/cloudinary')
const { sanitizeSongTitle } = require('../utils/validation')

const isProduction = process.env.NODE_ENV === 'production'

/**
 * Determines the folder path in Cloudinary based on the file type.
 * Audio files go to symponify/audio, images go to symponify/covers.
 * @param {Object} file - Multer file object
 * @returns {string} Cloudinary folder path
 */
const getUploadFolder = (file) => {
  if (file.fieldname === 'audio') return 'symponify/audio'
  return 'symponify/covers'
}

/**
 * Cloudinary storage configuration for Multer.
 * Uploads files directly to Cloudinary with proper public IDs and resource types.
 */
let storage

if (hasCloudinaryConfig()) {
  storage = {
    _handleFile: (req, file, cb) => {
      ensureCloudinaryConfigured()

      const title = sanitizeSongTitle(req.body.title || 'untitled')
      const suffix = file.fieldname === 'audio' ? 'audio' : 'cover'
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: getUploadFolder(file),
          public_id: `${title}-${suffix}-${Date.now()}`,
          resource_type: 'auto',
          use_filename: false,
          unique_filename: true,
          overwrite: false,
        },
        (error, result) => {
          if (error) {
            cb(error)
            return
          }

          cb(null, {
            path: result.secure_url,
            secure_url: result.secure_url,
            filename: result.public_id,
            public_id: result.public_id,
            resource_type: result.resource_type,
            bytes: result.bytes,
            format: result.format,
          })
        }
      )

      file.stream.pipe(upload)
    },
    _removeFile: (_req, file, cb) => {
      if (!file?.public_id) {
        cb(null)
        return
      }

      cloudinary.uploader.destroy(file.public_id, { resource_type: file.resource_type || 'image' }).finally(() => cb(null))
    },
  }
} else if (isProduction) {
  storage = {
    _handleFile: (_req, _file, cb) => {
      const error = new Error('Cloudinary is required for production uploads.')
      error.status = 500
      cb(error)
    },
    _removeFile: (_req, _file, cb) => cb(null),
  }
} else {
  // Fallback to local disk storage for development when Cloudinary is not configured
  const localRoot = path.join(__dirname, '../public/songs')

  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const title = sanitizeSongTitle(req.body.title || 'untitled')
      const folder = path.join(localRoot, title)
      try {
        fs.mkdirSync(folder, { recursive: true })
      } catch (e) {
        // ignore
      }
      cb(null, folder)
    },
    filename: (_req, file, cb) => {
      const safe = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      cb(null, safe)
    },
  })
}

/**
 * Validates file types based on field name.
 * Audio: MP3, WAV, OGG, M4A
 * Images: JPG, PNG, WEBP
 * @param {Object} req - Express request
 * @param {Object} file - Multer file object
 * @param {Function} cb - Callback function
 */
const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase()

  if (file.fieldname === 'audio') {
    const allowedAudio = ['.mp3', '.wav', '.ogg', '.m4a']
    const allowedMimeTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/mp4', 'audio/x-m4a']
    if (allowedAudio.includes(ext) && allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true)
      return
    }

    cb(new Error('Only MP3, WAV, OGG, and M4A audio files are allowed.'))
    return
  }

  const allowedImages = ['.jpg', '.jpeg', '.png', '.webp']
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (allowedImages.includes(ext) && allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true)
    return
  }

  cb(new Error('Only JPG, PNG, and WEBP image files are allowed.'))
}

/**
 * Multer instance configured for Cloudinary upload.
 * Handles both audio files (up to 50MB) and image files (up to 50MB).
 * Files are stored on Cloudinary, not on the local filesystem.
 */
module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit
})
