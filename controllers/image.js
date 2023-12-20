const express = require("express");
const Image = require("../models/Image");
const mongoose = require("mongoose");

exports.getImage = async (req, res, next) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(400).json({
        message: "No image is found with this id.",
        success: false,
      });
    }

    res.setHeader("Content-Type", image.contentType);
    return res.send(image.data);
  } catch (err) {
    res.status(400).json({
      error: err,
      success: false,
    });
  }
};
