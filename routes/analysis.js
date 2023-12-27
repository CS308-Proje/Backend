const express = require("express");
const analysisController = require("../controllers/analysis");

const router = express.Router();

const isAuth = require("../middlewares/isAuth");

router.get(
  "/song-analysis",
  isAuth.protect,
  analysisController.createAnalysisBasedOnSongs
);

router.post(
  "/artist-average-analysis",
  isAuth.protect,
  analysisController.analysisBasedOnArtistSongs
);

router.post(
  "/artist-songs-count-analysis",
  isAuth.protect,
  analysisController.analysisBasedOnArtistsSongsCount
);


router.post(
  "/mobile-artist-average-analysis",
  isAuth.protect,
  analysisController.mobileAnalysisBasedOnArtistSongs
);


router.post(
  "/mobile-artist-songs-count-analysis",
  isAuth.protect,
  analysisController.mobileAnalysisBasedOnArtistsSongsCount
);


module.exports = router;
