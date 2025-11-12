const express = require('express');
const router = express.Router();
const { fetchAttendanceDetailSheetData } = require('../controllers/AttendanceController');
const { fetchSallaryTrackerDetailSheetData } = require('../controllers/AttendanceController');

// POST /add-row
router.get('/Attendance-details', fetchAttendanceDetailSheetData);
router.get('/sallary-tracker-details', fetchSallaryTrackerDetailSheetData);

module.exports = router;
