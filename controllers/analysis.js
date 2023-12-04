const mongoose = require("mongoose");
const { Chart } = require("chart.js");
const User = require("../models/User");
const Song = require("../models/Song");
const Rating = require("../models/Rating");
const { createCanvas, loadImage } = require("canvas");
const {
  ChartJSNodeCanvas,
  CanvasRenderService,
} = require("chartjs-node-canvas");

exports.createAnalysis = async (req, res) => {
  try {
    // Create a canvas and context
    const canvas = createCanvas(400, 400);
    const ctx = canvas.getContext("2d");

    const user = await User.findById(req.user.id);
    const userId = user.id;

    const ratings = await Rating.find({ userId: userId });
    const ssd = ratings.map(rating => rating.ratingValue);
    console.log(ssd);

    // Create a chart
    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: [1, 2, 3, 4, 5],
        datasets: [
          {
            label: "Rating",
            data: ratings.map(rating => rating.ratingValue),
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(255, 206, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(153, 102, 255, 0.2)",
              "rgba(255, 159, 64, 0.2)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
              "rgba(255, 159, 64, 1)",
            ],
            borderWidth: 1,
          },
        ],
      },
    });

    // Render the chart to a URL
    const chartUrl = chart.toBase64Image();

    // Use the chart URL as needed
    return res.status(200).send({
      success: true,
      data: chartUrl,
    });
  } catch (err) {
    return res.status(400).json({
      error: err.message,
      success: false,
    });
  }
};

exports.createAnalysisBasedOnSongs = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const userId = user.id;

    const canvas = createCanvas(800, 800);
    const ctx = canvas.getContext("2d");

    const startDate = req.query.start;

    const endDate = req.query.end;

    let songArray = [];

    if (startDate && endDate) {
      songArray = await Song.find({
        userId: userId,
        release_date: { $gte: startDate, $lte: endDate },
      });
    } else if (startDate && !endDate) {
      songArray = await Song.find({
        userId: userId,
        release_date: { $gte: startDate, $lte: Date.now() },
      });
    } else if (!startDate && endDate) {
      songArray = await Song.find({
        userId: userId,
        release_date: { $gte: Date.now(), $lte: endDate },
      });
    } else if (!startDate && !endDate) {
      songArray = await Song.find({
        userId: userId,
        ratingValue: { $ne: null },
      }).sort({ ratingValue: -1 });
    }

    if (songArray.length === 0 || songArray === undefined) {
      return res.status(400).json({
        error: "No songs found",
        success: false,
      });
    }

    const songNames = songArray.map(song => song.songName);
    const songRatings = songArray.map(song => song.ratingValue);

    // Create a chart
    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: songNames,
        datasets: [
          {
            label: "Rating",
            data: songRatings,
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(255, 206, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(153, 102, 255, 0.2)",
              "rgba(255, 159, 64, 0.2)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
              "rgba(255, 159, 64, 1)",
            ],
            borderWidth: 1,
          },
        ],
      },
    });

    // Render the chart to a URL
    const chartUrl = chart.toBase64Image();

    // Use the chart URL as needed
    return res.status(200).send({
      success: true,
      data: chartUrl,
    });
  } catch (err) {
    return res.status(400).json({
      error: err.message,
      success: false,
    });
  }
};
