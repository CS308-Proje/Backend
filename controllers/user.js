const mongoose = require("mongoose");
const express = require("express");
const User = require("../models/User");
const Artist = require("../models/Artist");
const Album = require("../models/Album");
const Song = require("../models/Song");

exports.getUsers = async (req, res, next) => {
  try {
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
    const { name, username, email, password } = req.body;
    const user = await User.create({
      name: name,
      username: username,
      email: email,
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
      error: err,
      success: false,
    });
  }
};

exports.allowRecommendationsToFriends = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(400).json({
        message: "No user is found",
        success: false,
      });
    }

    user.allowFriendRecommendations = true;

    await user.save();

    return res.status(200).json({
      message:
        "User successfully updated. Now, your friends CAN see your musics!",
      success: true,
    });
  } catch (err) {
    return res.status(400).json({
      error: err.message,
      success: false,
    });
  }
};

exports.disallowRecommendationsToFriends = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(400).json({
        message: "No user is found",
        success: false,
      });
    }

    user.allowFriendRecommendations = false;

    await user.save();

    return res.status(200).json({
      message:
        "User successfully updated. Now, your friends CANNOT see your musics!",
      success: true,
    });
  } catch (err) {
    return res.status(400).json({
      error: err.message,
      success: false,
    });
  }
};
