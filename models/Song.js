const mongoose = require("mongoose");

const SongSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },

  songName: {
    type: String,
    required: [true, "Please enter a song name."],
  },

  mainArtistName: {
    type: String,
    required: true,
  },
  mainArtistId: {
    type: mongoose.Schema.ObjectId,
  },
  featuringArtistNames: [
    {
      type: String,
    },
  ],

  featuringArtistId: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Artist",
    },
  ],
  albumName: {
    type: String,
    required: [true, "Please add album."],
  },

  albumId: {
    type: mongoose.Types.ObjectId,
    ref: "Album",
  },

  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Song", SongSchema);
