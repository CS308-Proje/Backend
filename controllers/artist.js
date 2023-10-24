const mongoose = require("mongoose");
const express = require("express");
const User = require("../models/User");
const Song = require("../models/Song");
const Album = require("../models/Album");
const Artist = require("../models/Artist");

exports.getArtists = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    const userId = user.id;

    const artists = await Artist.find({
      userId: userId,
    });

    if (!artists || artists.length === 0) {
      return res.status(400).json({
        message: "No artist is found.",
        success: false,
      });
    }

    return res.status(200).json({
      artists,
      success: true,
    });
  } catch (err) {
    res.status(400).json({
      error: err,
      success: false,
    });
  }
};

exports.getArtist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    const userId = user.id;

    const artist = await Artist.find({
      userId: userId,
      _id: req.params.id,
    });

    if (!artist) {
      return res.status(400).json({
        message: "No artist is found with this id.",
        success: false,
      });
    }
    return res.status(200).json({
      artist,
      success: true,
    });
  } catch (err) {
    res.status(400).json({
      error: err,
      success: false,
    });
  }
};

exports.addArtist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    const userId = user.id;

    const { artistName } = req.body;

    const artist = await Artist.create({
      userId: userId,
      artistName: artistName,
    });

    if (!artist) {
      return res.status(400).json({
        message: "No artist is found.",
        success: false,
      });
    }
    return res.status(201).json({
      artist,
      success: true,
    });
  } catch (err) {
    res.status(400).json({
      error: err,
      success: false,
    });
  }
};

exports.updateArtist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const userId = user.id;

    const artist = await Artist.findByIdAndUpdate(
      { _id: req.params.id, userId: userId },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!artist) {
      return res.status(400).json({
        message: "No artist is found with this id",
        success: false,
      });
    }

    return res.status(200).json({
      artist,
      success: true,
    });
  } catch (err) {
    res.status(400).json({
      error: err,
      success: false,
    });
  }
};
/* //* Daha sonra bakacagim
exports.deleteArtist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const userId = user.id;

    const songs = await Song.find({
      userId: userId,
    });

    for (let index = 0; index < songs.length; index++) {
      if (songs[0].artistId.includes(req.params.id)) {
        const album = await Album.findByIdAndDelete({
          _id: songs[index].albumId,
          userId: userId,
        });
      }
    }
  } catch (err) {
    res.status(400).json({
      error: err,
      success: false,
    });
  }
};
*/
