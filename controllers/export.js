const Rating = require("../models/Rating");
const Song = require("../models/Song");
const User = require("../models/User");
const fs = require("fs");

exports.dataExport = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const userId = user.id;
    const artistName = req.query.artist;
    const rate = req.query.rating;

    let data = null;

    if (!artistName && !rate) {
      data = await Song.find({ userId: userId });
    } else if (!artistName && rate) {
      data = await Song.find({
        userId: userId,
        ratingValue: rate,
      });
    } else if (artistName && !rate) {
      data = await Song.find({ userId: userId, mainArtistName: artistName });
    } else if (artistName && rate) {
      data = await Song.find({
        userId: userId,
        mainArtistName: artistName,
        ratingValue: rate,
      });
    }

    if (!data || data.length === 0) {
      return res.status(400).json({
        error: "No data found.",
        success: false,
      });
    }

    const cleanedData = data.map(song => {
      return {
        songName: song.songName,
        artistName: song.mainArtistName,
        albumName: song.albumName,
        rating: song.ratingValue,
      };
    });

    // Specify the file path where the user wants to save the file
    const filePath = req.body.path;
    console.log(JSON.stringify(cleanedData));

    const fileName = "exportedData.json";
    const fileFullPath = `${filePath}/${fileName}`;

    // Save the JSON data to the specified file path
    fs.writeFileSync(fileFullPath, JSON.stringify(cleanedData));

    // Set headers for file download
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

    // Send the file as a response
    res.status(200).json({
      success: true,
      message: "File downloaded successfully.",
    });

    // Send the file as a response
    return res.sendFile(filePath);
  } catch (err) {
    return res.status(400).json({
      error: err,
      success: false,
    });
  }
};
