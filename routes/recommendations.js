const express = require("express");
const recommendationsController = require("../controllers/recommendations");

const router = express.Router();

const isAuth = require("../middlewares/isAuth");

router.get(
  "/based-on-song-ratings",
  isAuth.protect,
  recommendationsController.getRecommendationsBasedOnSongRating
);

router.get(
  "/based-on-album-ratings",
  isAuth.protect,
  recommendationsController.getRecommendationsBasedOnAlbumRating
);

router.get(
  "/based-on-artist-ratings",
  isAuth.protect,
  recommendationsController.getRecommendationsBasedOnArtistRating
);

router.get(
  "/based-on-spotify",
  isAuth.protect,
  recommendationsController.getRecommendationsFromSpotify
);

router.get(
  "/based-on-friends",
  isAuth.protect,
  recommendationsController.getRecommendationsBasedOnFriendActivity
);

router.get(
  "/based-on-temporal",
  isAuth.protect,
  recommendationsController.getRecommendationsBasedOnTemporalValues
);

router.get(
  "/based-on-ml",
  isAuth.protect,
  recommendationsController.getRecommendationsBasedOnMachineLearning
);

module.exports = router;
