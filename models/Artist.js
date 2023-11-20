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
  artistImg: {
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
});

ArtistSchema.index({ userId: 1, artistName: 1 }, { unique: true });

module.exports = mongoose.model("Artist", ArtistSchema);
