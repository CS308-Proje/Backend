const mongoose = require("mongoose");

const AlbumSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  name: {
    type: String,
    required: [true, "Please enter an album name."],
  },
  artistId: {
    type: mongoose.Types.ObjectId,
    ref: "Artist",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Album", AlbumSchema);
