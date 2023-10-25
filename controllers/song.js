const mongoose = require("mongoose");
const express = require("express");
const Song = require("../models/Song");
const User = require("../models/User");
const Album = require("../models/Album");
const Artist = require("../models/Artist");

exports.getSongs = async (req, res, next) => {
  //* Buraya pagination eklenecek
  try {
    const user = await User.findById(req.user.id);

    const userId = user.id;

    const songs = await Song.find({ userId: userId });

    if (!songs || songs.length === 0) {
      return res.status(400).json({
        message: "Songs cannot be found.",
        success: false,
      });
    }

    return res.status(200).json({
      songs,
      count: songs.length,
      success: true,
    });
  } catch (err) {
    return res.status(400).json({
      error: err,
      success: false,
    });
  }
};

exports.getSong = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    const userId = user.id;
    const song = await Song.find({ _id: req.params.id, userId: userId });

    if (!song) {
      return res.status(400).json({
        success: false,
        error: "No song is found.",
      });
    }
    res.status(200).json({
      success: true,
      song,
    });
  } catch (err) {
    res.status(400).json({
      error: err,
      success: false,
    });
  }
};

exports.addSong = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    const userId = user.id;

    const songData = { userId, ...req.body };

    const albumName = req.body.albumName;

    const album = await Album.create({
      userId: userId,
      name: albumName,
    });

    const artist = await Artist.create({
      userId: userId,
      artistName: req.body.mainArtistName,
      $push: { albumId: album._id },
    });

    songData

    await Album.updateOne({
      {_id: album._id},
      {$push: {arti}}
    })

    await album.updateOne()
  } catch (err) {
    res.status(400).json({
      error: err,
      success: false,
    });
  }
};

exports.deleteSong = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    const userId = user.id;
    const song = await Song.findByIdAndDelete({
      _id: req.params.id,
      userId: userId,
    });

    res.status(200).json({
      message: "Song is deleted.",
      success: true,
    });
  } catch (err) {
    res.status(400).json({
      error: err,
      success: false,
    });
  }
};

exports.updateSong = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    const userId = user.id;
    const song = await Song.findByIdAndUpdate(
      { _id: req.params.id, userId: userId },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!song) {
      return res.status(400).json({
        success: false,
        error: "No song is found.",
      });
    }

    res.status(200).json({
      success: true,
      song,
    });
  } catch (err) {
    res.status(400).json({
      error: err,
      success: false,
    });
  }
};
