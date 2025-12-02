const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.get('/my', reportController.getPatientReports);
router.get('/patient/:patientId', reportController.getPatientReports);
router.post('/', upload.single('file'), reportController.addReport);
router.put('/:id', upload.single('file'), reportController.updateReport);

module.exports = router;
