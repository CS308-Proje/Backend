const express = require("express");
const songController = require("../controllers/song");
const multer = require("multer");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const isAuth = require("../middlewares/isAuth");

router.get("/songs", isAuth.protect, songController.getSongs);

router.get("/songs/:id", isAuth.protect, songController.getSong);

router.post("/songs", isAuth.protect, songController.addSong);

router.delete("/songs/:id", isAuth.protect, songController.deleteSong);

router.put("/songs/:id", isAuth.protect, songController.updateSong);

router.post(
  "/upload-song-file",
  upload.single("file"),
  isAuth.protect,
  songController.addSongViaFile
);

router.post("/transfer-songs", isAuth.protect, songController.transferSongs);

router.get(
  "/directly-from-spotify",
  isAuth.protect,
  songController.addFromSpotifyAPIDirectly
);

router.post(
  "/spotify-search-to-db",
  isAuth.protect,
  songController.addSongToDBThatComesFromSpotifyAPI
);

router.post(
  "/add-song-not-from-spotify",
  isAuth.protect,
  songController.addSongThatIsNotFromSpotifyAPI
);

module.exports = router;
