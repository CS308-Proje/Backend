const express = require("express");
const userController = require("../controllers/user");

const router = express.Router();

const isAuth = require("../middlewares/isAuth");

router.get(
  "/users/songs",
  isAuth.protect,
  isAuth.authorize("admin"),
  userController.getAllSongs
);

router.get(
  "/users/albums",
  isAuth.protect,
  isAuth.authorize("admin"),
  userController.getAllAlbums
);

router.get(
  "/users/artists",
  isAuth.protect,
  isAuth.authorize("admin"),
  userController.getAllArtists
);

router.get(
  "/users",
  isAuth.protect,
  isAuth.authorize("admin"),
  userController.getUsers
);

router.get(
  "/users/:id",
  isAuth.protect,
  isAuth.authorize("admin"),
  userController.getUser
);

router.post(
  "/users",
  isAuth.protect,
  isAuth.authorize("admin"),
  userController.addUser
);

router.delete(
  "/users/:id",
  isAuth.protect,
  isAuth.authorize("admin"),
  userController.deleteUser
);

router.put(
  "/users/:id",
  isAuth.protect,
  isAuth.authorize("admin"),
  userController.updateUser
);

router.delete(
  "/users/delete-song/:id",
  isAuth.protect,
  isAuth.authorize("admin"),
  userController.deleteSong
);

router.delete(
  "/users/delete-album/:id",
  isAuth.protect,
  isAuth.authorize("admin"),
  userController.deleteAlbum
);

router.delete(
  "/users/delete-artist/:id",
  isAuth.protect,
  isAuth.authorize("admin"),
  userController.deleteArtist
);

module.exports = router;
