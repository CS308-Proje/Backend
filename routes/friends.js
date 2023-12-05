const express = require("express");
const router = express.Router();
const {
  addFriend,
  removeFriend,
  getAllFriends,
} = require("../controllers/friends");

const isAuth = require("../middlewares/isAuth");

// Route to add a friend
router.post("/add", isAuth.protect, addFriend);

// Route to remove a friend
router.delete("/remove/:id", isAuth.protect, removeFriend);

// Route to get all friends
router.get("/all", isAuth.protect, getAllFriends);

module.exports = router;
