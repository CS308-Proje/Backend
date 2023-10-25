const User = require('../models/User');
const ErrorResponse = require('../error/error-response');

exports.addFriend = async (req, res, next) => {
  try {
   
    const { userId, friendId } = req.body;

    
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    
    if (!user || !friend) {
      return next(new ErrorResponse('User or friend not found', 404));
    }

    
    if (user.friends.includes(friendId)) {
      return res.status(400).json({
        success: false,
        message: 'Friend is already in your list of friends',
      });
    }

   
    user.friends.push(friendId);
    friend.friends.push(userId);
    
    await user.save();
    await friend.save();

    res.status(200).json({
      success: true,
      message: 'Friend added successfully',
    });
  } catch (err) {
    next(err);
  }
};


exports.removeFriend = async (req, res, next) => {
  try {
    const { userId, friendId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    //Check if the friendId exists in the user's friend list
    if (!user.friends.includes(friendId)) {
      return res.status(400).json({
        success: false,
        message: 'Friend not found in your list of friends',
      });
    }

    user.friends = user.friends.filter((friend) => friend.toString() !== friendId);

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Friend removed successfully',
    });
  } catch (err) {
    next(err);
  }
};


exports.getAllFriends = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId).populate('friends');

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    if (!user.friends || user.friends.length === 0) {
      // If the user has no friends, return a message
      return res.status(200).json({
        success: true,
        message: 'No connections to view',
      });
    }

    res.status(200).json({
      success: true,
      friends: user.friends,
    });
  } catch (err) {
    next(err);
  }
};
