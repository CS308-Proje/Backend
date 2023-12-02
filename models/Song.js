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
    required: true,
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
  popularity: {
    type: Number,
  },

  duration_ms: {
    type: Number,
  },

  release_date: {
    type: Date,
  },
  albumImg: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  ratingValue: {
    type: Number,
    min: 0,
    max: 5,
  },
  usedInTemporalRecommendation: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Song", SongSchema);
