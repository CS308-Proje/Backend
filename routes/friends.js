const express = require('express');
const router = express.Router();
const { addFriend, removeFriend, getAllFriends } = require('../controllers/friends'); 

// Route to add a friend
router.post('/add', addFriend);

// Route to remove a friend
router.delete('/remove', removeFriend); 

// Route to get all friends
router.get('/all/:userId', getAllFriends);

module.exports = router;
