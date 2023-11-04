const User = require("../models/User");
const ErrorResponse = require("../error/error-response");
const crypto = require('crypto'); //*to generate secure tokens
const nodemailer = require('nodemailer'); //* for sending emails
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

//* Forgot Password
exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return next(new ErrorResponse("There is no user with that email", 404));
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
      // Set up nodemailer transporter
      let transporter = nodemailer.createTransport({
    
      });
      
      // Send the email
      let info = await transporter.sendMail({
        from: '"Your Company Name" <support@yourcompany.com>', 
        to: user.email,
        subject: "Password reset token",
        text: message,
      });

      res.status(200).json({ success: true, data: 'Email sent' });
    } catch (err) {
      console.log(err);

      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return next(new ErrorResponse("Email could not be sent", 500));
    }

  } catch (err) {
    next(err);
  }
};

//* Reset Password
exports.resetPassword = async (req, res, next) => {

  const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return next(new ErrorResponse('Invalid token', 400));
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
    
  } catch (err) {
    next(err);
  }
};

