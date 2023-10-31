const mongoose = require("mongoose");
const express = require("express");
const Album = require("../models/Album");
const Song = require("../models/Song");
const Rating = require("../models/Rating");


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

    res.status(200).json({ message: 'Album Rated!' });
  } catch (err) {
    next(err);
  }
};