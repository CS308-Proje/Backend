const Rating = require("../models/Rating");
const Song = require("../models/Song");
const User = require("../models/User");
const fs = require("fs");
const { Parser } = require("json2csv");

exports.dataExport = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const userId = user.id;
    const artistName = req.query.artist;
    const rate = req.query.rating;
    let format = req.query.format;

    if (format !== "csv") {
      format = "json";
    }

    let query = { userId: userId, ratingValue: { $exists: true, $ne: null } };
    if (artistName) query.mainArtistName = artistName;
    if (rate) query.ratingValue = rate;

    let data = await Song.find(query);

    if (!data || data.length === 0) {
      return res.status(400).json({
        error: "No rated data found.",
        success: false,
      });
    }

    const cleanedData = data.map((song) => ({
      songName: song.songName,
      artistName: song.mainArtistName,
      albumName: song.albumName,
      rating: song.ratingValue,
    }));

    let fileData;
    let fileType;

    if (format === "csv") {
      const json2csvParser = new Parser();
      fileData = json2csvParser.parse(cleanedData);
      fileType = "text/csv";
    } else {
      fileData = JSON.stringify(cleanedData);
      fileType = "application/json";
    }

    const filePath = req.body.path;
    const fileName = `exportedData.${format}`;
    const fileFullPath = `${filePath}/${fileName}`;

    await fs.writeFileSync(fileFullPath, fileData);

    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.setHeader("Content-Type", fileType);

    return res.sendFile(fileFullPath);
  } catch (err) {
    return res.status(400).json({
      error: err.message,
      success: false,
    });
  }
};
