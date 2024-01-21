const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const Invitation = require("../models/Invitation");
const User = require("../models/User");
const { getAllInvitations } = require("../controllers/invitation");
const {
  getRecommendationsBasedOnFriendActivity,
} = require("../controllers/recommendations");

const e = require("express");

exports.getInvitationNotification = async (
  req,
  res,
  next,
  limitResponse = false
) => {
  try {
    const user = await User.findById(req.user.id);
    const invitations_message = await getAllInvitations(req, res, next, true);

    if (limitResponse) {
      return invitations_message;
    } else {
      res.status(200).json({ message: invitations_message });
    }
  } catch (err) {
    next(err);
  }
};

exports.getFriendActivityNotification = async (
  req,
  res,
  next,
  limitResponse = false
) => {
  try {
    const user = await User.findById(req.user.id);
    const recommendations_message =
      await getRecommendationsBasedOnFriendActivity(req, res, next, true);

    if (limitResponse) {
      return recommendations_message;
    } else {
      return { message: recommendations_message };
    }
  } catch (err) {
    next(err);
  }
};

exports.getAllNotifications = async (req, res, next) => {
  try {
    const invitationNotifications = await exports.getInvitationNotification(
      req,
      res,
      next,
      true
    );
    var friendActivityNotifications =
      await exports.getFriendActivityNotification(req, res, next, true);

    const allNotifications = {
      invitations: invitationNotifications,
      friendActivities: friendActivityNotifications,
    };

    if (
      allNotifications.invitations === "No pending invitations at the time" &&
      allNotifications.friendActivities === "No new friend activity."
    ) {
      return res.status(201).json({ message: "No notifications" });
    }

    return res.status(200).json(allNotifications);
  } catch (err) {
    next(err);
  }
};
