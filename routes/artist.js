const express = require("express");
const artistContoller = require("../controllers/artist");

const router = express.Router();

const isAuth = require("../middlewares/isAuth");

router.get("/artists", isAuth.protect, artistContoller.getArtists);

router.get("/artists/:id", isAuth.protect, artistContoller.getArtist);

router.post("/artists", isAuth.protect, artistContoller.addArtist);

router.delete("/artists/:id", isAuth.protect, artistContoller.deleteArtist);

router.put("/artists/:id", isAuth.protect, artistContoller.updateArtist);

module.exports = router;
