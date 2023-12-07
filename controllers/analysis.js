const mongoose = require("mongoose");
const User = require("../models/User");
const Song = require("../models/Song");
const Album = require("../models/Album");
const Artist = require("../models/Artist");
const Rating = require("../models/Rating");

const nodeHtmlToImage = require("node-html-to-image");

exports.createAnalysisBasedOnSongs = async (req, res, next) => {
  try {
    //? for dates we should enter YYYY-MM-DD
    const user = await User.findById(req.user.id);
    const userId = user.id;
    const type = req.query.type;
    let itemArray = [];

    var start = req.query.start;

    var end = req.query.end;

    if (type === null) {
      return res.status(400).json({
        error: "Please enter a type. Type can be song, album or artist.",
        success: false,
      });
    } else if (type === "song") {
      if (start && end) {
        itemArray = await Song.find({
          userId: userId,
          ratingValue: { $ne: null },
          createdAt: { $gte: start, $lte: end },
        })
          .sort({ ratingValue: -1 })
          .limit(10);
      } else if (!start && end) {
        itemArray = await Song.find({
          userId: userId,
          ratingValue: { $ne: null },
          createdAt: { $lte: end },
        })
          .sort({ ratingValue: -1 })
          .limit(10);
      } else if (start && !end) {
        itemArray = await Song.find({
          userId: userId,
          ratingValue: { $ne: null },
          createdAt: { $gte: start },
        })
          .sort({ ratingValue: -1 })
          .limit(10);
      } else if (!start && !end) {
        itemArray = await Song.find({
          userId: userId,
          ratingValue: { $ne: null },
        })
          .sort({ ratingValue: -1 })
          .limit(10);
      }
    } else if (type === "album") {
      if (start && end) {
        itemArray = await Album.find({
          userId: userId,
          ratingValue: { $ne: null },
          createdAt: { $gte: start, $lte: end },
        })
          .sort({ ratingValue: -1 })
          .limit(10);
      } else if (!start && end) {
        itemArray = await Album.find({
          userId: userId,
          ratingValue: { $ne: null },
          createdAt: { $lte: end },
        })
          .sort({ ratingValue: -1 })
          .limit(10);
      } else if (start && !end) {
        itemArray = await Album.find({
          userId: userId,
          ratingValue: { $ne: null },
          createdAt: { $gte: start },
        })
          .sort({ ratingValue: -1 })
          .limit(10);
      } else if (!start && !end) {
        itemArray = await Album.find({
          userId: userId,
          ratingValue: { $ne: null },
        })
          .sort({ ratingValue: -1 })
          .limit(10);
      }
    } else if (type === "artist") {
      if (start && end) {
        itemArray = await Artist.find({
          userId: userId,
          ratingValue: { $ne: null },
          createdAt: { $gte: start, $lte: end },
        })
          .sort({ ratingValue: -1 })
          .limit(10);
      } else if (!start && end) {
        itemArray = await Artist.find({
          userId: userId,
          ratingValue: { $ne: null },
          createdAt: { $lte: end },
        })
          .sort({ ratingValue: -1 })
          .limit(10);
      } else if (start && !end) {
        itemArray = await Artist.find({
          userId: userId,
          ratingValue: { $ne: null },
          createdAt: { $gte: start },
        })
          .sort({ ratingValue: -1 })
          .limit(10);
      } else if (!start && !end) {
        itemArray = await Artist.find({
          userId: userId,
          ratingValue: { $ne: null },
        })
          .sort({ ratingValue: -1 })
          .limit(10);
      }
    }

    if (itemArray.length === 0 || itemArray === null) {
      return res.status(400).json({
        error: `No ${type} found`,
        success: false,
      });
    }

    let htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400&display=swap" rel="stylesheet">
        <style>
          body {
            background-color: blue;
            margin: 0;
            padding: 5px;
            color: white;
            font-family: 'Roboto', sans-serif;
            max-width: 500px;
            margin: 0 auto;
          }

          .song-container {
            display: flex;
            margin-bottom: 10px;
            padding: 10px;
            background-color: blue;
            border-radius: 5px;
            align-items: center;
          }

          .song-number {
            font-size: 1.2em;
            font-weight: bold;
            margin-right: 10px;
            color: white;
          }

          .song-image {
            max-width: 100px;
            max-height: 100px;
            margin-right: 10px;
            border-radius: 5px; /* Add border radius to the image */
          }

          .song-details {
            display: flex;
            flex-direction: column;
            justify-content: center;
            margin-left: 10%;
            color: white;
            flex-grow: 1; /* Allow details to take remaining space */
          }

          h1 {
            text-align: center;
            color: white;
            margin-bottom: 10px; /* Add margin bottom to the heading */
          }
        </style>
      </head>
      <body>
        <h1>My Favorite ${type.charAt(0).toUpperCase() + type.slice(1)}s</h1>
    `;

    let counter = 1;

    if (type === "song") {
      itemArray.forEach((item) => {
        htmlContent += `
          <div class="song-container">
            <div class="song-number">${counter}</div>
            <img src="${item.albumImg}" alt="Album Image" class="song-image">
            <div class="song-details">
              <h3>${item.songName}</h3>
              <p>${item.mainArtistName}</p>
            </div>
          </div>
        `;
        counter++;
      });
    } else if (type === "album") {
      itemArray.forEach((item) => {
        htmlContent += `
          <div class="song-container">
            <div class="song-number">${counter}</div>
            <img src="${item.albumImg}" alt="Album Image" class="song-image">
            <div class="song-details">
              <h3>${item.name}</h3>
            </div>
          </div>
        `;
        counter++;
      });
    } else if (type === "artist") {
      itemArray.forEach((item) => {
        htmlContent += `
          <div class="song-container">
            <div class="song-number">${counter}</div>
            <img src="${item.artistImg}" alt="Album Image" class="song-image">
            <div class="song-details">
              <h3>${item.artistName}</h3>
            </div>
          </div>
        `;
        counter++;
      });
    }

    htmlContent += `
      </body>
      </html>
    `;

    const img = await nodeHtmlToImage({
      html: htmlContent,
    });

    var base64Image = img.toString("base64");
    base64Image = "data:image/png;base64," + base64Image;

    return res.status(200).json({
      success: true,
      data: base64Image,
    });
  } catch (err) {
    return res.status(400).json({
      error: err.message,
      success: false,
    });
  }
};

exports.analysisBasedOnArtistSongs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const userId = user.id;

    const artistArray = req.body.artists;

    const start = req.query.start;
    const end = req.query.end;

    let averageRatings = [];

    var songsOfAnArtist = [];

    if (artistArray === null || artistArray.length === 0) {
      return res.status(400).json({
        error: "Please enter an artist name or names.",
        success: false,
      });
    }

    for (let i = 0; i < artistArray.length; i++) {
      if (start && end) {
        songsOfAnArtist = await Song.find({
          userId: userId,
          mainArtistName: artistArray[i],
          createdAt: { $gte: start, $lte: end },
        });
      } else if (!start && end) {
        songsOfAnArtist = await Song.find({
          userId: userId,
          mainArtistName: artistArray[i],
          createdAt: { $lte: end },
        });
      } else if (start && !end) {
        songsOfAnArtist = await Song.find({
          userId: userId,
          mainArtistName: artistArray[i],
          createdAt: { $gte: start },
        });
      } else if (!start && !end) {
        songsOfAnArtist = await Song.find({
          userId: userId,
          mainArtistName: artistArray[i],
        });
      }

      if (!songsOfAnArtist || songsOfAnArtist.length === 0) {
        continue;
        return res.status(400).json({
          error: `No songs with artist named ${artistArray[i]} is found.`,
          success: false,
        });
      }

      let totalRating = 0;
      let songCounter = 0;
      songsOfAnArtist.forEach((song) => {
        totalRating += song.ratingValue;
        songCounter++;
      });

      let averageRating = totalRating / songCounter;

      averageRatings.push(averageRating);
    }

    const chartDataString = JSON.stringify({
      labels: artistArray,
      datasets: [
        {
          label: "Average Ratings",
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(255, 159, 64, 0.2)",
            "rgba(255, 205, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(153, 102, 255, 0.2)",
            "rgba(201, 203, 207, 0.2)",
          ],
          borderColor: [
            "rgb(255, 99, 132)",
            "rgb(255, 159, 64)",
            "rgb(255, 205, 86)",
            "rgb(75, 192, 192)",
            "rgb(54, 162, 235)",
            "rgb(153, 102, 255)",
            "rgb(201, 203, 207)",
          ],
          borderWidth: 1,
          data: averageRatings,
        },
      ],
    });

    const htmlContent = `
    <html>
      <head>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      </head>
      <body>
        <canvas id="myChart"></canvas>
        <script>
          var ctx = document.getElementById('myChart').getContext('2d');
          var chartData = ${chartDataString};
          new Chart(ctx, {
            type: 'bar',
            data: chartData,
          });
        </script>
      </body>
    </html>
  `;

    const img = await nodeHtmlToImage({
      html: htmlContent,
    });

    var base64Image = img.toString("base64");
    base64Image = "data:image/png;base64," + base64Image;

    console.log(averageRatings);
    return res.status(200).json({
      success: true,
      data: base64Image,
    });
  } catch (err) {
    return res.status(400).json({
      message: err.message,
      success: false,
    });
  }
};

exports.analysisBasedOnArtistsSongsCount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const userId = user.id;

    const artistArray = req.body.artists;

    const start = req.query.start;

    const end = req.query.end;

    let songs = [];
    let songsCount = [];

    if (!artistArray) {
      return res.status(400).json({
        error: "Please enter an artist name or names.",
        success: false,
      });
    }

    for (let i = 0; i < artistArray.length; i++) {
      if (start && end) {
        songs = await Song.find({
          userId: userId,
          mainArtistName: artistArray[i],
          createdAt: { $gte: start, $lte: end },
        });
      } else if (!start && end) {
        songs = await Song.find({
          userId: userId,
          mainArtistName: artistArray[i],
          createdAt: { $lte: end },
        });
      } else if (start && !end) {
        songs = await Song.find({
          userId: userId,
          mainArtistName: artistArray[i],
          createdAt: { $gte: start },
        });
      } else if (!start && !end) {
        songs = await Song.find({
          userId: userId,
          mainArtistName: artistArray[i],
        });
      }

      if (!songs) {
        continue;
      }

      songsCount.push(songs.length);
    }

    const chartDataString = JSON.stringify({
      labels: artistArray,
      datasets: [
        {
          label: "Number of Songs",
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(255, 159, 64, 0.2)",
            "rgba(255, 205, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(153, 102, 255, 0.2)",
            "rgba(201, 203, 207, 0.2)",
          ],
          borderColor: [
            "rgb(255, 99, 132)",
            "rgb(255, 159, 64)",
            "rgb(255, 205, 86)",
            "rgb(75, 192, 192)",
            "rgb(54, 162, 235)",
            "rgb(153, 102, 255)",
            "rgb(201, 203, 207)",
          ],
          borderWidth: 1,
          data: songsCount,
        },
      ],
    });

    const htmlContent = `
    <html>
      <head>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      </head>
      <body>
        <canvas id="myChart"></canvas>
        <script>
          var ctx = document.getElementById('myChart').getContext('2d');
          var chartData = ${chartDataString};
          new Chart(ctx, {
            type: 'doughnut',
            data: chartData,
          });
        </script>
      </body>
    </html>
  `;

    /* const img = await nodeHtmlToImage({
      html: htmlContent,
    });

    var base64Image = img.toString("base64");
    base64Image = "data:image/png;base64," + base64Image;
*/
    res.header("Content-Type", "text/html");
    return res.status(200).send(htmlContent);
  } catch (err) {
    return res.status(400).json({
      message: err.message,
      success: false,
    });
  }
};
