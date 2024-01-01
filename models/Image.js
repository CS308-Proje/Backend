const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  data: {
    type: Buffer,
  },
  contentType: {
    type: String,
  },
});

module.exports = mongoose.model("Image", imageSchema);
