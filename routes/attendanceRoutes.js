const express = require('express');
const router = express.Router();
const { fetchAttendanceDetailSheetData , fetchSallaryTrackerDetailSheetData , createSallaryDetails} = require('../controllers/AttendanceController');

// POST /add-row
router.get('/Attendance-details', fetchAttendanceDetailSheetData);
router.get('/sallary-tracker-details', fetchSallaryTrackerDetailSheetData);
router.post('/create-sallary-details', createSallaryDetails);

module.exports = router;
