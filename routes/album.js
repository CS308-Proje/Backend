const express = require("express");
const albumController = require("../controllers/album");

const router = express.Router();

const isAuth = require("../middlewares/isAuth");

router.get("/albums", isAuth.protect, albumController.getAlbums);

router.get("/albums/:id", isAuth.protect, albumController.getAlbum);

router.delete("/albums/:id", isAuth.protect, albumController.deleteAlbum);

router.put("/albums/:id", isAuth.protect, albumController.updateAlbum);

module.exports = router;
