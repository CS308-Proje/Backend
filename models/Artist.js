const mongoose = require("mongoose");

const ArtistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  artistName: {
    type: String,
  },
  albums: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Album",
      required: [true, "Please add album."],
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Artist", ArtistSchema);
