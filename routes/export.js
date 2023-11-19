// routes/export.js
const express = require('express');
const router = express.Router();
const exportController = require('../controllers/export');

router.get('/byArtistName', exportController.exportRatingsByArtistName);

module.exports = router;
