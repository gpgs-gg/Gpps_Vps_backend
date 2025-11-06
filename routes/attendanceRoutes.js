const express = require('express');
const router = express.Router();
const { fetchAttendanceDetailSheetData } = require('../controllers/AttendanceController');

// POST /add-row
router.get('/Attendance-details', fetchAttendanceDetailSheetData);

module.exports = router;
