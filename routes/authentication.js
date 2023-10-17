const express = require("express");
const authenticationController = require("../controllers/authentication");

const router = express.Router();

const isAuth = require("../middlewares/isAuth");

router.post("/register", authenticationController.register);
router.post("/login", authenticationController.login);
router.post("/logout", isAuth.protect, authenticationController.logout);

router.get("/me", isAuth.protect, authenticationController.getMe);

module.exports = router;
