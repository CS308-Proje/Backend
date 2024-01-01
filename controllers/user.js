const mongoose = require("mongoose");
const express = require("express");
const User = require("../models/User");
const Artist = require("../models/Artist");
const Album = require("../models/Album");
const Song = require("../models/Song");

exports.getUsers = async (req, res, next) => {
  try {
    const username = req.query.username;

    if (username) {
      const users = await User.find({
        username: { $regex: username, $options: "i" },
      });

      return res.status(200).json({
        users,
        success: true,
      });
    }

    const users = await User.find();

    if (!users || users.length === 0) {
      return res.status(400).json({
        message: "No user is found",
        success: false,
      });
    }

    res.status(200).json({
      users,
      success: true,
    });
  } catch (err) {
    res.status(400).json({
      error: err,
      success: false,
    });
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(400).json({
        message: "No user is found with this id.",
        success: false,
      });
    }

    res.status(200).json({
      user,
      success: true,
    });
  } catch (err) {
    res.status(400).json({
      error: err,
      success: false,
    });
  }
};

exports.addUser = async (req, res, next) => {
  try {
    const { name, username, email, role, password } = req.body;
    const user = await User.create({
      name: name,
      username: username,
      email: email,
      role: role,
      password: password,
    });

    if (!user) {
      return res.status(400).json({
        message: "Cannot create user.",
        success: false,
      });
    }

    return res.status(201).json({
      user,
    });
  } catch (err) {
    res.status(400).json({
      error: err,
      success: false,
    });
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      { _id: req.params.id },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return res.status(400).json({
        message: "No user is found",
        success: false,
      });
    }

    return res.status(200).json({
      user,
      success: true,
    });
  } catch (err) {
    res.status(400).json({
      error: err,
      success: false,
    });
  }
};

//* Buraya delete gelecek ve user'in girdigi her veriyi silecek.

exports.deleteUser = async (req, res, next) => {
  try {
    const artists = await Artist.deleteMany({ userId: req.params.id });
    const albums = await Album.deleteMany({ userId: req.params.id });
    const songs = await Song.deleteMany({ userId: req.params.id });

    const user = await User.deleteOne({ _id: req.params.id });

    if (!songs || !albums || !artists) {
      return res.status(400).json({
        message: "Something went wrong.",
        success: false,
      });
    }

    return res.status(200).json({
      message: "User successfully deleted.",
      success: true,
    });
  } catch (err) {
    res.status(400).json({
      error: err,
      success: false,
    });
  }
};

exports.getAllSongs = async (req, res, next) => {
  try {
    const name = req.query.name;

    if (name) {
      const songs = await Song.find({
        songName: { $regex: name, $options: "i" },
      });
      if (!songs || songs.length === 0) {
        return res.status(400).json({
          message: "No song is found.",
          success: false,
        });
      }
      return res.status(200).json({
        songs,
        success: true,
      });
    }

    const songs = await Song.find();

    if (!songs || songs.length === 0) {
      return res.status(400).json({
        message: "No song is found in the database.",
        success: false,
      });
    }

    return res.status(200).json({
      songs,
      success: true,
    });
  } catch (err) {
    return res.status(400).json({
      error: err.message,
      success: false,
    });
  }
};

exports.getAllAlbums = async (req, res, next) => {
  try {
    const name = req.query.name;
    if (name) {
      const albums = await Album.find({
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

    const albums = await Album.find().populate("artistId");

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

exports.getAllArtists = async (req, res, next) => {
  try {
    const name = req.query.name;
    if (name) {
      const artists = await Artist.find({
        artistName: { $regex: name, $options: "i" },
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
    }
    const artists = await Artist.find();

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
      error: err.message,
      success: false,
    });
  }
};

exports.deleteArtist = async (req, res, next) => {
  try {
    const artist = await Artist.findById(req.params.id);

    const userId = artist.userId;

    const songs = await Song.deleteMany({
      userId: userId,
      mainArtistId: req.params.id,
    });

    const albums = await Album.deleteMany({
      userId: userId,
      artistId: req.params.id,
    });

    const artistDelete = await Artist.deleteOne({
      userId: userId,
      _id: req.params.id,
    });

    return res.status(200).json({
      message: "Artist is deleted.",
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
    const album = await Album.findById(req.params.id);

    const userId = album.userId;

    const songs = await Song.deleteMany({
      userId: userId,
      albumId: req.params.id,
    });

    if (!songs || songs.length === 0) {
      return res.status(400).json({
        message: "This album does not contain any song.",
        success: false,
      });
    }
    const albumDelete = await Album.findByIdAndDelete({
      userId: userId,
      _id: req.params.id,
    });
    if (!albumDelete) {
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
      error: err.message,
      success: false,
    });
  }
};

exports.deleteSong = async (req, res, next) => {
  try {
    const song = await Song.deleteOne({ _id: req.params.id });

    if (!song) {
      return res.status(400).json({
        message: "Something went wrong.",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Song successfully deleted.",
      success: true,
    });
  } catch (err) {
    return res.status(400).json({
      error: err.message,
      success: false,
    });
  }
};
