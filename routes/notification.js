const express = require("express");
const router = express.Router();
const isAuth = require('../middlewares/isAuth'); 
const {getInvitationNotification, getTemporalNotficiation, getFriendActivityNotification} = require('../controllers/notification');


router.get('/invitationNotification', isAuth.protect, getInvitationNotification);
router.get('/temporalNotification', isAuth.protect, getTemporalNotficiation);
router.get('/friendActivityNotification', isAuth.protect, getFriendActivityNotification);

module.exports = router;