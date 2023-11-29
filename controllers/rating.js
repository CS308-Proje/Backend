const mongoose = require("mongoose");
const express = require("express");
const Album = require("../models/Album");
const Song = require("../models/Song");
const Rating = require("../models/Rating");
const Artist = require("../models/Artist");
const User = require("../models/User");

// Rate a song
exports.rateSong = async (req, res, next) => {
  try {
    const {ratingValue} = req.body;
    const songId = req.params.songId;
    
    const user = await User.findById(req.user.id);
    const userId = user.id;

    const song = await Song.findById(songId);

    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    if (ratingValue < 0 || ratingValue > 5) {
      return res
        .status(400)
        .json({ message: "Rating value must be between 0 and 5" });
    }
    
    rating = new Rating({ songId, userId, ratingValue });
    await rating.save();

    res.status(200).json({ message: "Song Rated!" });
  } catch (err) {
    next(err);
  }
};

// Rate an album
exports.rateAlbum = async (req, res, next) => {
  try {
    const { ratingValue } = req.body;

    const albumId = req.params.albumId;
    const user = await User.findById(req.user.id);
    const userId = user.id;

    if (ratingValue < 0 || ratingValue > 5) {
      return res
        .status(400)
        .json({ message: "Rating value must be between 0 and 5" });
    }
    const album = await Album.findById(albumId);

    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    rating = new Rating({ albumId, userId, ratingValue });
    await rating.save();

    res.status(200).json({ message: "Album Rated!" });
  } catch (err) {
    next(err);
  }
};

// Rate an artist
exports.rateArtist = async (req, res, next) => {
  try {
    const { ratingValue } = req.body;

    const artistId = req.params.artistId;
    const user = await User.findById(req.user.id);
    const userId = user.id;

    if (ratingValue < 0 || ratingValue > 5) {
      return res
        .status(400)
        .json({ message: "Rating value must be between 0 and 5" });
    }

    rating = new Rating({ artistId, userId, ratingValue });
    await rating.save();

    res.status(200).json({ message: "Artist Rated!" });
  } catch (err) {
    next(err);
  }
};
