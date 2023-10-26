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

    const userId = user._id;

    const songData = { userId, ...req.body };

    const albumName = req.body.albumName;

    const album = await Album.create({
      userId: userId,
      name: albumName,
    });

    const artist = await Artist.create({
      userId: userId,
      artistName: req.body.mainArtistName,
    });

    await artist.albumId.push(album._id);

    await artist.save();

    songData.albumId = album._id;
    songData.mainArtistId = artist._id;
    songData.featuringArtistId = [];
    for (let index = 1; index < req.body.featuringArtistNames.length; index++) {
      const featuringArtistName = req.body.featuringArtistNames[index];
      const artist = await Artist.create({
        userId: userId,
        artistName: featuringArtistName,
      });
      songData.featuringArtistId.push(artist._id);
    }
    const song = await Song.create({
      userId: songData.userId,
      songName: songData.songName,
      mainArtistName: songData.mainArtistName,
      mainArtistId: songData.mainArtistId,
      featuringArtistNames: songData.featuringArtistNames,
      featuringArtistId: songData.featuringArtistId,
      albumName: songData.albumName,
      albumId: songData.albumId,
    });

    const albumModify = await Album.updateOne(
      { _id: album._id },
      {
        $push: { songId: song._id },
      }
    );

    return res.status(201).json({
      song,
      success: true,
    });
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
    const song = await Song.findById({
      _id: req.params.id,
      userId: userId,
    });

    const albumId = song.albumId;

    const updatedAlbum = await Album.findByIdAndUpdate(
      albumId,
      { $pull: { songId: song._id } },
      { new: true }
    );
    const songDeleted = await Song.findByIdAndDelete(req.params.id);
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
