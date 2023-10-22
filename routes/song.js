const express = require("express");
const songController = require("../controllers/song");

const router = express.Router();

const isAuth = require("../middlewares/isAuth");

router.get("/songs", isAuth.protect, songController.getSongs);

router.get("/songs/:id", isAuth.protect, songController.getSong);

router.post("/songs", isAuth.protect, songController.addSong);

router.delete("/songs/:id", isAuth.protect, songController.deleteSong);

router.put("/songs/:id", isAuth.protect, songController.updateSong);

module.exports = router;
