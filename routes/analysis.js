const express = require("express");
const analysisController = require("../controllers/analysis");

const router = express.Router();

const isAuth = require("../middlewares/isAuth");

router.get("/chart", isAuth.protect, analysisController.createAnalysis);

router.get(
  "/song-analysis",
  isAuth.protect,
  analysisController.createAnalysisBasedOnSongs
);

router.get("/song-canvas", isAuth.protect, analysisController.songCanvas);

module.exports = router;
