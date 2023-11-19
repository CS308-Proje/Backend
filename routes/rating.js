const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Rating = require('../models/Rating'); 
const { rateSong, rateAlbum, rateArtist } = require('../controllers/rating');

// Rate a song
router.post('/rateSong', rateSong);

// Rate an album
router.post('/rateAlbum', rateAlbum);

// Rate an Artist
router.post('/rateArtist', rateArtist);

// Export song ratings by a specific artist
router.get('/exportRatingsByArtist', async (req, res) => {
    const artistId = req.query.artistId; // pass the artist ID in the query string

    if (!mongoose.Types.ObjectId.isValid(artistId)) {
        return res.status(400).send('Invalid artist ID.');
    }
    /*try {
        // if you dont want to acces the song,album and artist ID.
        const ratings = await Rating.find({ artistId: mongoose.Types.ObjectId(artistId) }).exec(); */
    try {
        const ratings = await Rating.find({ artistId: mongoose.Types.ObjectId(artistId) })
                                    .populate('songId') 
                                    .populate('albumId')
                                    .populate('artistId') 
                                    .exec();

        // Convert the results to JSON
        const ratingsJson = JSON.stringify(ratings);

        // Set the headers to prompt the download
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=${artistId}-ratings.json`);

        // Send response
        res.send(ratingsJson);
    } catch (error) {
        res.status(500).send('Error exporting ratings: ' + error.message);
    }
});

module.exports = router;
