const mongoose = require("mongoose");
const User = require("../models/User");
const Song = require("../models/Song");
const Album = require("../models/Album");
const Artist = require("../models/Artist");
const Rating = require("../models/Rating");

exports.createAnalysisBasedOnSongs = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const userId = user.id;

    let songArray = [];

    songArray = await Song.find({
      userId: userId,
      ratingValue: { $ne: null },
    }).sort({ ratingValue: -1 });

    if (songArray.length === 0 || songArray === undefined) {
      return res.status(400).json({
        error: "No songs found",
        success: false,
      });
    }

    res.writeHead(200, { "Content-Type": "text/html" });

    // Write the HTML header
    res.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>My Favorite Songs</title>
        <style>
          body {
            background-color: blue; /* Set the background color to blue */
            margin: 0; /* Remove default margin */
            padding: 5px; /* Add some padding */
          }

          .song-container {
            display: flex;
            margin-bottom: 10px;
            padding: 10px;
            background-color: white; /* Set the background color of each song container */
            border-radius: 5px; /* Add border-radius for a rounded look */
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
        <h1 style="color: white;">My Favorite Songs</h1>
    `);

    let counter = 1;
    songArray.forEach((song) => {
      res.write(`
      <div class="song-container">
      <div class="song-number">${counter}</div>
      <img src="${song.albumImg}" alt="Album Image" class="song-image">
      <div class="song-details">
        <h3>${song.songName}</h3>
        <p>${song.mainArtistName}</p>
      </div>
    </div>
      `);
      counter++;
    });

    res.end(`
        </body>
      </html>
    `);
  } catch (err) {
    return res.status(400).json({
      error: err.message,
      success: false,
    });
  }
};
