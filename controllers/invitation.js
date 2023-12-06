const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const Invitation = require("../models/Invitation");
const User = require("../models/User");
const { addFriend } = require("../controllers/friends");
const ErrorResponse = require("../error/error-response");

//Send Invitation
exports.createInvitation = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;

    const user = await User.findById(req.user.id);
    const userId = user.id;
    const targetUser = await User.findById(targetUserId);

    const existingInvitation = await Invitation.findOne({
      user_id: userId,
      target_user_id: targetUserId,
    });

    if (existingInvitation) {
      return res.status(400).json({ message: "Invitation already exists" });
    }

    if (!user || !targetUser) {
      return res.status(404).json({ message: "User or target user not found" });
    }

    const invitation = new Invitation({
      user_id: userId,
      target_user_id: targetUserId,
    });

    await invitation.save();

    return res.status(201).json({ message: "Invitation sent!" });
  } catch (err) {
    next(err);
  }
};

//Delete existing Invitation
exports.deleteInvitation = async (req, res, next) => {
  try {
    const { invitationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(invitationId)) {
      return res.status(400).json({ message: "Invalid Invitation ID" });
    }

    const invitation = await Invitation.findById(invitationId);

    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    await invitation.deleteOne();

    return res.status(200).json({ message: "Invitation deleted!" });
  } catch (err) {
    next(err);
  }
};

// Update Invitation status
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const { invitationId } = req.params;

    const invitation = await Invitation.findById(invitationId);

    const userId = invitation.user_id;
    const friendId = invitation.target_user_id;

    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    if (status === "accepted") {
      const result1 = await addFriend(userId, friendId, invitationId);

      if (result1 === -1) {
        return res
          .status(404)
          .json({ message: "User or friend not found", success: false });
      }
      if (result1 === -2) {
        return res
          .status(400)
          .json({ message: "Friend already exists", success: false });
      }

      if (result1 === 1) {
        return res
          .status(200)
          .json({ message: "You have accepted the invite" });
      }
    } else if (status === "rejected") {
      await Invitation.deleteOne({ _id: invitationId });
      return res.status(200).json({ message: "Invitation deleted!" });
    } else {
      return res.status(400).json({ message: "Invalid status" });
    }
  } catch (err) {
    next(err);
  }
};

//Gets all pending invitations of the user
exports.getAllInvitations = async (req, res, next, limitResponse = false) => {
  try {
    const user = await User.findById(req.user.id);
    const userId = user.id;

    const invitations = await Invitation.find({ target_user_id: userId });
    const message = `You have ${invitations.length} pending invitations.`;
    const null_message = "No pending invitations at the time";

    if (limitResponse) {
      if (invitations.length === 0) {
        return null_message;
      } else {
        return message;
      }
    } else {
      if (invitations.length === 0) {
        return res
          .status(200)
          .json({ message: "No pending invitations at the time" });
      } else {
        res.status(200).json({
          message: message,
          invitations: invitations,
        });
      }
    }
  } catch (err) {
    next(err);
  }
};
