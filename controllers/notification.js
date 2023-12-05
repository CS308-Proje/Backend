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
      const invitations_message = await getAllInvitations(req,res,next,true);    

      return invitations_message;
    
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
    
          const recommendations_message = await getRecommendationsBasedOnFriendActivity(req,res,next,true);

          return recommendations_message;
           
        }catch (err) {
          next(err);
        }
    };



    exports.getAllNotifications = async (req, res, next) => {
      try {
        const user = await User.findById(req.user.id);
        const userId = user.id;
    
       
        const invitationNotifications = await exports.getInvitationNotification(req, res, next);
        const friendActivityNotifications = await exports.getFriendActivityNotification(req, res, next);
    
        const allNotifications = {
          invitations: invitationNotifications,
          friendActivities: friendActivityNotifications
        };
    
        
        res.status(200).json(allNotifications);
        
      } catch (err) {
        next(err);
      }
    };