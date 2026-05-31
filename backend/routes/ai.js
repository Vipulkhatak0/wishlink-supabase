const express = require('express');
const router = express.Router();
const { generateMessage, generateLoveLetter } = require('../controllers/aiController');
const { protect, checkPlan } = require('../middleware/auth');

router.post('/generate-message', generateMessage);
router.post('/love-letter', protect, checkPlan('platinum'), generateLoveLetter);

module.exports = router;
