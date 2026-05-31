const express = require('express');
const router = express.Router();
const { createWish, getMyWishes, getWish, updateWish, deleteWish, publishWish, getTrending, unlockSecret } = require('../controllers/wishController');
const { protect } = require('../middleware/auth');

router.get('/trending', getTrending);
router.post('/', protect, createWish);
router.get('/my', protect, getMyWishes);
router.get('/:id', protect, getWish);
router.put('/:id', protect, updateWish);
router.delete('/:id', protect, deleteWish);
router.put('/:id/publish', protect, publishWish);
router.post('/:slug/unlock-secret', unlockSecret);

module.exports = router;
