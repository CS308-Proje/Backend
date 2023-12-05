const express = require("express");
const router = express.Router();
const {
  createInvitation,
  updateStatus,
  deleteInvitation,
  getAllInvitations,
} = require("../controllers/invitation");

const isAuth = require("../middlewares/isAuth");

// Create an invitation
router.post("/createInvitation/:id", isAuth.protect, createInvitation);

// Delete an invitation by ID
router.delete("/delete/:invitationId", isAuth.protect, deleteInvitation);

// Update the status of an invitation
router.post("/update/:invitationId", isAuth.protect, updateStatus);

//Get all the invitations for current user
router.get("/getallinv", isAuth.protect, getAllInvitations);

module.exports = router;
