const express = require("express");
const userController = require("../controllers/user");

const router = express.Router();

const isAuth = require("../middlewares/isAuth");

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

router.post(
  "/users/allow-recommendations",
  isAuth.protect,
  userController.allowRecommendationsToFriends
);

router.post(
  "/users/disallow-recommendations",
  isAuth.protect,
  userController.disallowRecommendationsToFriends
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

module.exports = router;
