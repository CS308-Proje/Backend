const mongoose = require("mongoose");

const ArtistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  artistName: {
    type: String,
    required: true,
  },

  albumId: [
    {
      type: mongoose.Types.ObjectId,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Artist", ArtistSchema);
