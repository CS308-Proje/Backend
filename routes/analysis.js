const express = require("express");
const analysisController = require("../controllers/analysis");

const router = express.Router();

const isAuth = require("../middlewares/isAuth");

router.get("/chart", isAuth.protect, analysisController.createAnalysis);

module.exports = router;
