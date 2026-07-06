const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const dietPlanStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'home/diet-sass/diet-plans',
    resource_type: 'raw',
    public_id: (_req, file) => `diet-plan-${Date.now()}-${Math.round(Math.random() * 1E9)}`,
  },
});

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'home/diet-sass/progress-photos',
    format: 'webp',
    transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto:good', fetch_format: 'webp' }],
    public_id: (_req, file) => `progress-photo-${Date.now()}-${Math.round(Math.random() * 1E9)}`,
  },
});

module.exports = { cloudinary, dietPlanStorage, imageStorage };
