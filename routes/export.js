// routes/export.js
const express = require("express");
const router = express.Router();
const exportController = require("../controllers/export");
const isAuth = require("../middlewares/isAuth");

router.get("/export", isAuth.protect, exportController.dataExport);

module.exports = router;
