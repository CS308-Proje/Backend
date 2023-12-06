const express = require("express");
const analysisController = require("../controllers/analysis");

const router = express.Router();

const isAuth = require("../middlewares/isAuth");

router.get(
  "/song-analysis",
  isAuth.protect,
  analysisController.createAnalysisBasedOnSongs
);

module.exports = router;
