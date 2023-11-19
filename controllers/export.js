const Rating = require("../models/Rating");
const Song = require("../models/Song");
const User = require("../models/User");

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

    const cleanedData = data.map((song) => {
      return {
        songName: song.songName,
        artistName: song.mainArtistName,
        albumName: song.albumName,
        rating: song.ratingValue,
      };
    });

    return res.status(200).json({
      data: cleanedData,
      success: true,
    });
  } catch (err) {
    return res.status(400).json({
      error: err,
      success: false,
    });
  }
};
