const express = require('express');
const router = express.Router();
const { rateSong, rateAlbum } = require('../controllers/rating');

// Rate a song
router.post('/rateSong', rateSong);

// Rate an album
router.post('/rateAlbum', rateAlbum);

module.exports = router;
