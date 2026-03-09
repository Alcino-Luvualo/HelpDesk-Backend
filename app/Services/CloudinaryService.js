'use strict'

const { v2: cloudinary } = require('cloudinary')

let configured = false

function configureCloudinary() {
  if (configured) {
    return
  }

  const cloudinaryUrl = process.env.CLOUDINARY_URL

  if (!cloudinaryUrl) {
    throw new Error('CLOUDINARY_URL não configurada')
  }

  const parsed = new URL(cloudinaryUrl)

  cloudinary.config({
    cloud_name: parsed.hostname,
    api_key: decodeURIComponent(parsed.username),
    api_secret: decodeURIComponent(parsed.password),
    secure: true
  })

  configured = true
}

function extractPublicId(imageUrl) {
  if (!imageUrl || !imageUrl.includes('res.cloudinary.com')) {
    return null
  }

  const parsed = new URL(imageUrl)
  const pathParts = parsed.pathname.split('/').filter(Boolean)
  const uploadIndex = pathParts.findIndex((part) => part === 'upload')

  if (uploadIndex === -1) {
    return null
  }

  let publicIdParts = pathParts.slice(uploadIndex + 1)

  if (publicIdParts[0] && /^v\d+$/.test(publicIdParts[0])) {
    publicIdParts = publicIdParts.slice(1)
  }

  if (!publicIdParts.length) {
    return null
  }

  const lastPart = publicIdParts.pop()
  publicIdParts.push(lastPart.replace(/\.[^.]+$/, ''))

  return publicIdParts.join('/')
}

async function uploadImage(filePath, entityType, entityId) {
  configureCloudinary()

  return cloudinary.uploader.upload(filePath, {
    folder: `helpdesk/${entityType}`,
    public_id: `${entityType}_${entityId}_${Date.now()}`,
    resource_type: 'image',
    overwrite: true
  })
}

async function deleteImageByUrl(imageUrl) {
  const publicId = extractPublicId(imageUrl)

  if (!publicId) {
    return null
  }

  configureCloudinary()

  return cloudinary.uploader.destroy(publicId, {
    resource_type: 'image'
  })
}

module.exports = {
  uploadImage,
  deleteImageByUrl
}
