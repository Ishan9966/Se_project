const express = require('express');
const router = express.Router();
const symptomController = require('../controllers/symptomController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.post('/analyze', upload.single('image'), symptomController.analyzeSymptom);

module.exports = router;
