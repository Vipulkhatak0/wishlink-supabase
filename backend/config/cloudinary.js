const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'wishlink/images', allowed_formats: ['jpg','jpeg','png','gif','webp'] },
});
const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'wishlink/videos', resource_type: 'video', allowed_formats: ['mp4','mov','avi'] },
});
const audioStorage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'wishlink/audio', resource_type: 'video', allowed_formats: ['mp3','wav','ogg'] },
});

module.exports = {
  cloudinary,
  uploadImage: multer({ storage: imageStorage }),
  uploadVideo: multer({ storage: videoStorage }),
  uploadAudio: multer({ storage: audioStorage }),
};
