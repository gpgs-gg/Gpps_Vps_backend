const express = require('express');
const router = express.Router();
const { fetchAttendanceDetailSheetData , fetchSallaryTrackerDetailSheetData , createSallaryDetails} = require('../controllers/AttendanceController');

// POST /add-row
router.get('/Attendance-details/:month', fetchAttendanceDetailSheetData);
router.get('/sallary-tracker-details/:month', fetchSallaryTrackerDetailSheetData);
router.post('/create-sallary-details/:month', createSallaryDetails);

module.exports = router;
