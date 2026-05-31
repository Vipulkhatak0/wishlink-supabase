const asyncHandler = require('../middleware/async');
const { cloudinary } = require('../config/cloudinary');

exports.uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  res.status(200).json({ success: true, url: req.file.path, publicId: req.file.filename });
});
exports.uploadVideo = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  res.status(200).json({ success: true, url: req.file.path, publicId: req.file.filename });
});
exports.uploadAudio = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  res.status(200).json({ success: true, url: req.file.path, publicId: req.file.filename });
});
exports.deleteFile = asyncHandler(async (req, res) => {
  const { publicId, resourceType } = req.body;
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType || 'image' });
  res.status(200).json({ success: true, message: 'File deleted' });
});
