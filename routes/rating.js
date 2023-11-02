const express = require('express');
const router = express.Router();
const { rateSong, rateAlbum , rateArtist} = require('../controllers/rating');

// Rate a song
router.post('/rateSong', rateSong);

// Rate an album
router.post('/rateAlbum', rateAlbum);

// Rate an Artist
router.post('/rateArtist', rateArtist);

module.exports = router;
