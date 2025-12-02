const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.get('/my', prescriptionController.getPatientPrescriptions);
router.get('/patient/:patientId', prescriptionController.getPatientPrescriptions);
router.post('/', upload.single('image'), prescriptionController.addPrescription);
router.put('/:id', upload.single('image'), prescriptionController.updatePrescription);

module.exports = router;
