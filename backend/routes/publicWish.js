const express = require('express');
const router = express.Router();
const { getPublicWish } = require('../controllers/wishController');

router.get('/:slug', getPublicWish);

module.exports = router;
