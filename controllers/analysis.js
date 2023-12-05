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

    const canvas = createCanvas(400, 400);
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

    res.writeHead(200, { "Content-Type": "text/html" });

    // Write the HTML header
    res.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Songs and Ratings</title>
        <style>
          .song-container {
            display: flex;
            margin-bottom: 10px;
            background-color: red;
            padding: 10px;
          }
  
          .song-image {
            max-width: 100px;
            max-height: 100px;
            margin-right: 10px;
          }
  
          .song-details {
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
        </style>
      </head>
      <body>
    `);

    // Write the HTML body with dynamically generated content
    songArray.forEach(song => {
      res.write(`
        <div class="song-container">
          <img src="${song.albumImg}" alt="Album Image" class="song-image">
          <div class="song-details">
            <h3>${song.songName}</h3>
            <p>Rating: ${song.mainArtistName}</p>
          </div>
        </div>
      `);
    });

    // Write the HTML footer and end the response
    res.end(`
        </body>
      </html>
    `);

    /*
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
    */
  } catch (err) {
    return res.status(400).json({
      error: err.message,
      success: false,
    });
  }
};

exports.songCanvas = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const userId = user.id;

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
    const canvasHeight = songArray.length * 120 + 50;
    const canvas = createCanvas(400, canvasHeight);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "blue";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const title = "My Favourite Songs";

    ctx.fillStyle = "white";
    ctx.font = "30px Arial";

    const titleX = (canvas.width - ctx.measureText(title).width) / 2;
    const titleY = 30;
    ctx.fillText(title, titleX, titleY); // Adjust position
    let y = 50;
    var i = 1;
    for (const song of songArray) {
      // Load image
      ctx.fillStyle = "white";
      ctx.font = "20px Arial";
      ctx.fillText(i, 10, y + 30);

      const image = await loadImage(song.albumImg);

      // Draw image

      ctx.drawImage(image, 30, y, 100, 100);

      // Draw text
      ctx.fillStyle = "white";
      ctx.font = "20px Arial";
      ctx.fontWeight = "bold";
      ctx.fillText(song.songName, 150, y + 30);
      ctx.font = "15px Arial";
      ctx.fillText(song.mainArtistName, 150, y + 60);

      // Adjust Y position for the next item
      y += 120;
      i++;
    }

    // Set the Content-Type to image/png
    res.writeHead(200, { "Content-Type": "image/png" });

    // Convert canvas to PNG and stream it to the response
    canvas.createPNGStream().pipe(res);
  } catch (err) {
    return res.status(400).json({
      error: err.message,
      success: false,
    });
  }
};
