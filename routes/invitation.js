const express = require("express");
const router = express.Router();
const {
  createInvitation,
  updateStatus,
  deleteInvitation,
  getAllInvitations,
} = require("../controllers/invitation");

// Create an invitation
router.post("/createInvitation", createInvitation);

// Delete an invitation by ID
router.delete("/delete/:invitationId", deleteInvitation);

// Update the status of an invitation
router.post("/update/:invitationId", updateStatus);

//Get all the invitations for current user
router.get("/getallinv", getAllInvitations);

module.exports = router;
