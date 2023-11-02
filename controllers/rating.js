const mongoose = require("mongoose");
const express = require("express");
const Album = require("../models/Album");
const Song = require("../models/Song");
const Rating = require("../models/Rating");
const Artist = require("../models/Artist");


// Rate a song
exports.rateSong = async (req, res, next) => {
  try {
    const { songId, userId, ratingValue } = req.body;

    if (ratingValue < 0 || ratingValue > 5) {
      return res.status(400).json({ message: 'Rating value must be between 0 and 5' });
    }
    let rating = await Rating.findOne({ songId, userId });

    if (!rating) {
      rating = new Rating({ songId, userId, ratingValue });
    } else {
      rating.ratingValue = ratingValue;
    }
    await rating.save();

    const song = await Song.findById(songId);

    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    song.ratingValue = ratingValue;
    await song.save();

    res.status(200).json({ message: 'Song Rated!' });
  } catch (err) {
    next(err);
  }
};



// Rate an album
exports.rateAlbum = async (req, res, next) => {
  try {
    const { albumId, userId, ratingValue } = req.body;

    if (ratingValue < 0 || ratingValue > 5) {
      return res.status(400).json({ message: 'Rating value must be between 0 and 5' });
    }
    const album = await Album.findById(albumId);

    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }

    let rating = await Rating.findOne({ albumId, userId });

    if (!rating) {
      rating = new Rating({ albumId, userId, ratingValue });
    } else {
      rating.ratingValue = ratingValue;
    }
    await rating.save();

    album.ratingValue = ratingValue;
    await album.save();

    res.status(200).json({ message: 'Album Rated!' });
  } catch (err) {
    next(err);
  }
};

// Rate an artist
exports.rateArtist = async (req, res, next) => {
  try {
    const { artistId, userId, ratingValue } = req.body;

    if (ratingValue < 0 || ratingValue > 5) {
      return res.status(400).json({ message: 'Rating value must be between 0 and 5' });
    }

    let rating = await Rating.findOne({ artistId, userId });

    if (!rating) {
      rating = new Rating({ artistId, userId, ratingValue });
    } else {
      rating.ratingValue = ratingValue;
    }

    await rating.save();

    const artist = await Artist.findById(artistId);
    artist.ratingValue = ratingValue;
    await artist.save();

    res.status(200).json({ message: 'Artist Rated!' });
  } catch (err) {
    next(err);
  }
};

