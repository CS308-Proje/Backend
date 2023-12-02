const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Invitation = require('../models/Invitation');
const User = require('../models/User');
const {getAllInvitations} = require('../controllers/invitation');
const {getRecommendationsBasedOnFriendActivity} = require('../controllers/recommendations');



exports.getInvitationNotification = async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      const userId = user.id;
      const invitations = await getAllInvitations(req,res,next,true);    
    
    } catch (err) {
      next(err);
    }
  };


exports.getTemporalNotficiation = async (req, res, next) => { 
};

exports.getFriendActivityNotification = async (req, res, next) => {
    try{
          const user = await User.findById(req.user.id);
          const userId = user.id;
    
          const recommendations = await getRecommendationsBasedOnFriendActivity(req,res,next,true);
           
        }catch (err) {
          next(err);
        }
    };