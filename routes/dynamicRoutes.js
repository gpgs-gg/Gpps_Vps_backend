const express = require('express');
const router = express.Router();
const { fetchDynamicSheetData } = require('../controllers/DynamicValueController');
const { fetchDynamicSheetDataForAandSD } = require('../controllers/DynamicValueController');

// POST /add-row
router.get('/dynamic-values', fetchDynamicSheetData);
router.get('/AgreementAndSD', fetchDynamicSheetDataForAandSD);

module.exports = router;
