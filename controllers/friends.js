const User = require("../models/User");
const ErrorResponse = require("../error/error-response");
const Invitation = require("../models/Invitation");

exports.addFriend = async (userId, friendId, invitationId) => {
  // -1 means that the user or friend was not found
  // -2 means that the friend is already in the user's friend list
  // 1 means that the friend was added successfully
  const user = await User.findById(userId);
  const friend = await User.findById(friendId);

  if (!user || !friend) {
    return -1;
  }

  if (
    user.friends.some((friend) => friend.toString() === friendId.toString())
  ) {
    return -2;
  } else {
    user.friends.push(friendId);
    friend.friends.push(userId);

    await user.save();
    await friend.save();
    await Invitation.deleteOne({ _id: invitationId });
    return 1;
  }
};

exports.removeFriend = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const friendId = req.params.id;

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return next(new ErrorResponse("User or friend not found", 404));
    }

    if (!user.friends.some((friendDoc) => friendDoc.toString() === friendId)) {
      return res.status(400).json({
        success: false,
        message: "Friend not found in your list of friends",
      });
    }

    user.friends = user.friends.filter(
      (friendDoc) => friendDoc.toString() !== friendId
    );

    friend.friends = friend.friends.filter(
      (userDoc) => userDoc.toString() !== userId
    );

    user.allowFriendRecommendations = user.allowFriendRecommendations.filter(
      (id) => !id.equals(friendId)
    );

    friend.allowFriendRecommendations =
      friend.allowFriendRecommendations.filter((id) => !id.equals(userId));

    await user.save();
    await friend.save();

    res.status(200).json({
      success: true,
      data: {},
      message: "Friend removed successfully",
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllFriends = async (req, res, next) => {
  try {
    const userU = await User.findById(req.user.id);

    const userId = userU.id;

    const user = await User.findById(userId).populate("friends");

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    if (!user.friends || user.friends.length === 0) {
      // If the user has no friends, return a message
      return res.status(200).json({
        success: true,
        message: "No connections to view",
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

exports.allowFriendRecommendations = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const friend = await User.findById(req.params.id);

    if (!user || !friend) {
      return res.status(400).json({
        message: "User or friend not found.",
        success: false,
      });
    }

    if (!user.friends.includes(friend._id)) {
      return res.status(400).json({
        message: "You can only allow recommendations from existing friends.",
        success: false,
      });
    }

    if (user.allowFriendRecommendations.includes(friend._id)) {
      return res.status(400).json({
        message: "You already allowed this user for recommendations.",
        success: false,
      });
    }

    user.allowFriendRecommendations.push(friend._id);
    await user.save();

    return res.status(200).json({
      message: "Friend allowed for recommendations successfully.",
      success: true,
    });
  } catch (err) {
    return res.status(400).json({
      error: err.message,
      success: false,
    });
  }
};

exports.disallowFriendRecommendations = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const friend = await User.findById(req.params.id);

    if (!user || !friend) {
      return res.status(400).json({
        message: "User or friend not found.",
        success: false,
      });
    }

    if (!user.friends.includes(friend._id)) {
      return res.status(400).json({
        message: "You can only disallow recommendations from existing friends.",
        success: false,
      });
    }

    if (!user.allowFriendRecommendations.includes(friend._id)) {
      return res.status(400).json({
        message: "This user is not currently allowed for recommendations.",
        success: false,
      });
    }

    user.allowFriendRecommendations = user.allowFriendRecommendations.filter(
      (id) => !id.equals(friend._id)
    );
    await user.save();

    return res.status(200).json({
      message: "Friend disallowed for recommendations successfully.",
      success: true,
    });
  } catch (err) {
    return res.status(400).json({
      error: err.message,
      success: false,
    });
  }
};
