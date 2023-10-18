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
  songs: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Song",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Artist", ArtistSchema);
