


const express = require('express');
const multer = require('multer');
const router = express.Router();
const { CheckInOut } = require('../controllers/CkeckInOutController');

// Use memory storage (for processing files directly in memory)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB per file
});

// Expect files under 'files' key matching frontend's FormData
router.post('/Check-out-req', upload.array('OutSelfie', 5), CheckInOut);

module.exports = router;
