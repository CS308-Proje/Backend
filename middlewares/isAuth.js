const jwt = require("jsonwebtoken");

const ErrorResponse = require("../error/error-response");
const User = require("../models/User");

// Protect routes
exports.protect = async (req, res, next) => {
  try {
    let token = "";

    //token = req.cookies.token;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      const decoded = await jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id);
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      const decoded = await jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id);
    } else {
      return res.status(400).json({
        message: "There are problems with token.",
        success: false,
      });
    }

    next();
  } catch (err) {
    return res.status(400).json({
      message: err.message,
      success: false,
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
