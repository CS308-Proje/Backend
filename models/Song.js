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
  performers: [
    {
      type: String,
      required: [true, "Please add artist(s)"],
    },
  ],
  album: {
    type: String,
    required: [true, "Please add album."],
  },
  length: {
    type: String,
    required: [true, "Please add length."],
  },
  tempo: {
    type: String,
    required: [true, "Please add length."],
  },
  genre: {
    type: String,
    required: [true, "Please add genre."],
  },
  mood: {
    type: String,
    required: [true, "Please add genre."],
  },
  releaseYear: {
    type: Date,
    required: [true, "Please enter a release date."],
  },

  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Song", SongSchema);
