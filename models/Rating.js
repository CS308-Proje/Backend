const mongoose = require("mongoose");

const RatingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  songId: {
    type: mongoose.Types.ObjectId,
    ref: 'Song',
    default: null,
    required: false,
  },
  albumId: {
    type: mongoose.Types.ObjectId,
    ref: 'Album',
    default: null,
    required: false,
  },
  ratingValue: {
    type: Number,
    min: 0, 
    max: 5, 
    default: null,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Rating", RatingSchema);
