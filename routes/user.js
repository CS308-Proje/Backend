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

module.exports = router;
