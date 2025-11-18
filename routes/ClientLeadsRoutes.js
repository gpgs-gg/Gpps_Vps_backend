const express = require('express');
const router = express.Router();
const {  createClientLeads, getAllClientsLeads, updateClientLeads } = require('../controllers/LeadsForGpgsController');

// GET - All clients
router.get('/get-Leads', getAllClientsLeads);

// POST - New client
router.post('/create-Leads', createClientLeads);
router.put('/update-Leads', updateClientLeads);

module.exports = router;