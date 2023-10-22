const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Invitation = require('../models/Invitation');
const User = require('../models/User');
const { addFriend } = require('../controllers/friends');

//Send Invitation
exports.createInvitation = async (req, res, next) => {
  try {
    const { userId, targetUserId } = req.body;

    const existingInvitation = await Invitation.findOne({
      user_id: userId,
      target_user_id: targetUserId,
    });

    if (existingInvitation) {
      return res.status(400).json({ message: 'Invitation already exists' });
    }

    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);

    if (!user || !targetUser) {
      console.log('User:', user);
      console.log('Target User:', targetUser);
      return res.status(404).json({ message: 'User or target user not found' });
    }

    const invitation = new Invitation({
      user_id: userId,
      target_user_id: targetUserId,
    });

    await invitation.save();

    return res.status(201).json({ message: 'Invitation sent!' });
  } catch (err) {
    next(err);
  }
};

//Delete existing Invitation
exports.deleteInvitation = async (req, res, next) => {
  try {
    const { invitationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(invitationId)) {
      return res.status(400).json({ message: 'Invalid Invitation ID' });
    }

    const invitation = await Invitation.findById(invitationId);

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    await invitation.deleteOne();

    return res.status(201).json({message: 'Invitation deleted!'});
  } catch (err) {
    next(err);
  }
};




// Update Invitation status
exports.updateStatus = async (req, res, next) => {
  try {
    const { invitationId } = req.params;
    const { status } = req.body;

    const invitation = await Invitation.findById(invitationId);

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    if (status === 'accepted') {
      
      await addFriend({ body: { userId: invitation.user_id, friendId: invitation.target_user_id } });
      await addFriend({ body: { userId: invitation.target_user_id, friendId: invitation.user_id } });
      return res.status(201).json({message: 'You have accepted the invite'});

    } else if (status === 'rejected') {
      await Invitation.deleteOne({ _id: invitationId }); 
      return res.status(201).json({message: 'Invitation deleted!'});
    }

    invitation.status = status;
    await invitation.save();

    res.status(200).json({ message: 'Invitation status updated' });
  } catch (err) {
    next(err);
  }
};


//Gets all pending invitations of the user
exports.getAllInvitations = async (req, res, next) => {
  try {
    const { userId } = req.body;

    const invitations = await Invitation.find({ target_user_id: userId });

    console.log(userId);

    if (invitations.length === 0) {
      return res.status(200).json({ message: 'No pending invitations at the time' });
    }

    res.status(200).json(invitations);
  } catch (err) {
    next(err);
  }
};

