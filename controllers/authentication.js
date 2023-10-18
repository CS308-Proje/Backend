const User = require("../models/User");
const ErrorResponse = require("../error/error-response");

const { matchPassword, sendTokenResponse } = require("../utils/userUtils");

//* Register User
exports.register = async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;

    const user = await User.create({
      name,
      username,
      email,
      password,
      role: "normal",
    });

    //! create the token
    await sendTokenResponse(user, 200, res);

    /*
    res.status(201).json({
      success: true,
      message: "You are registered.",
    });
    */
  } catch (err) {
    next(err);
  }
};

//* Login User
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    //* Validate email and password
    if (!email || !password) {
      return next(new ErrorResponse("Please fill the missing values!", 400));
    }

    //* Check for user
    const user = await User.findOne({ email: email }).select("+password");

    if (!user) {
      return next(
        new ErrorResponse("No user is found with these credentials!", 400)
      );
    }

    //* Check if password matches
    const isMatch = await matchPassword(password, user.password);

    if (!isMatch) {
      return next(new ErrorResponse("Wrong password!", 400));
    }

    await sendTokenResponse(user, 200, res);
  } catch (err) {
    return next(
      new ErrorResponse("Cannot login right now. Try again later", 400)
    );
  }
};

exports.logout = async (req, res, next) => {
  try {
    res.cookie("token", "none", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Cannot logout!",
    });
  }
};

//* Get current logged in user
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    return next(
      new ErrorResponse(
        "Error occured in showing your profile. Try again later.",
        400
      )
    );
  }
};
