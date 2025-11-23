const express = require('express');
const router = express.Router();
const { fetchDynamicSheetData , fetchDynamicSheetDataForAandSD , fetchDynamicSheetDataForAllowedUsers } = require('../controllers/DynamicValueController');

// POST /add-row
router.get('/dynamic-values', fetchDynamicSheetData);
router.get('/AgreementAndSD', fetchDynamicSheetDataForAandSD);
router.get('/permissions', fetchDynamicSheetDataForAllowedUsers);

module.exports = router;
