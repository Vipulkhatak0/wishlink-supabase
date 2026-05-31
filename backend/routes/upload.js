const express = require('express');
const router = express.Router();
const { uploadImage, uploadVideo, uploadAudio, deleteFile } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const { uploadImage: multerImage, uploadVideo: multerVideo, uploadAudio: multerAudio } = require('../config/cloudinary');

router.post('/image', protect, multerImage.single('image'), uploadImage);
router.post('/video', protect, multerVideo.single('video'), uploadVideo);
router.post('/audio', protect, multerAudio.single('audio'), uploadAudio);
router.delete('/', protect, deleteFile);

module.exports = router;
