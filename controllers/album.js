const mongoose = require("mongoose");
const express = require("express");
const User = require("../models/User");
const Album = require("../models/Album");
const Song = require("../models/Song");
const Artist = require("../models/Artist");

exports.getAlbums = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    const userId = user.id;

    const name = req.query.name;
    if (name) {
      const albums = await Album.find({
        userId: userId,
        name: { $regex: name, $options: "i" },
      });
      if (!albums || albums.length === 0) {
        return res.status(400).json({
          message: "No album is found.",
          success: false,
        });
      }
      return res.status(200).json({
        albums,
        success: true,
      });
    }

    const albums = await Album.find({ userId: userId });

    if (!albums || albums.length === 0) {
      return res.status(400).json({
        message: "No album is found.",
        success: false,
      });
    }

    return res.status(200).json({
      albums,
      success: true,
    });
  } catch (err) {
    res.status(400).json({
      error: err,
      success: false,
    });
  }
};

exports.getAlbum = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const userId = user.id;

    const album = await Album.find({
      userId: userId,
      _id: req.params.id,
    });

    if (!album || album.length === 0) {
      return res.status(400).json({
        message: "No album is found.",
        success: false,
      });
    }

    return res.status(200).json({
      album,
      success: true,
    });
  } catch (err) {
    res.status(400).json({
      error: err,
      success: false,
    });
  }
};

exports.updateAlbum = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    const userId = user.id;

    const album = await Album.findByIdAndUpdate(
      { _id: req.params.id, userId: userId },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!album) {
      return res.status(400).json({
        message: "No album is found",
        success: false,
      });
    }

    return res.status(200).json({
      album,
      success: true,
    });
  } catch (err) {
    res.status(400).json({
      error: err,
      success: false,
    });
  }
};

exports.deleteAlbum = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const userId = user.id;

    const songs = await Song.deleteMany({
      userId: userId,
      albumId: req.params.id,
    });

    if (!songs) {
      return res.status(400).json({
        message: "Could not delete songs or song.",
        success: false,
      });
    }
    const album = await Album.findByIdAndDelete({
      userId: userId,
      _id: req.params.id,
    });
    if (!album) {
      return res.status(400).json({
        message: "Could not delete songs or song.",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Album is deleted.",
      success: true,
    });
  } catch (err) {
    res.status(400).json({
      error: err,
      success: false,
    });
  }
};
