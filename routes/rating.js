const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating'); 
const { rateSong, rateAlbum, rateArtist } = require('../controllers/rating');
const isAuth = require('../middlewares/isAuth'); 

// Rate a song with authentication
router.post('/rateSong/:songId', isAuth.protect, rateSong);

// Rate an album with authentication
router.post('/rateAlbum/:albumId', isAuth.protect, rateAlbum);

// Rate an artist with authentication
router.post('/rateArtist/:artistId', isAuth.protect, rateArtist);

module.exports = router;
