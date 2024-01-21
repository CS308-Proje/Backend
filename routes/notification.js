const express = require("express");
const router = express.Router();
const isAuth = require("../middlewares/isAuth");
const {
  getInvitationNotification,
  getTemporalNotficiation,
  getFriendActivityNotification,
  getAllNotifications,
} = require("../controllers/notification");

router.get(
  "/invitationNotification",
  isAuth.protect,
  getInvitationNotification
);
router.get(
  "/friendActivityNotification",
  isAuth.protect,
  getFriendActivityNotification
);
router.get("/getAllNotification", isAuth.protect, getAllNotifications);

module.exports = router;
