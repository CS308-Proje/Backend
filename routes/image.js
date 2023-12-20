const express = require("express");
const imageController = require("../controllers/image");
const router = express.Router();

router.get("/:id", imageController.getImage);

module.exports = router;
