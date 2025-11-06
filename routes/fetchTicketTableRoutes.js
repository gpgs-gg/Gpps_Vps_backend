const express = require('express');
const router = express.Router();
const { fetchTicketSheetData } = require('../controllers/FetchTicketTableController');

// POST /add-row
router.get('/tick-sheet-data', fetchTicketSheetData);

module.exports = router;
