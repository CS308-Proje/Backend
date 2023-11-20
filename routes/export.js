// routes/export.js
const express = require("express");

const exportController = require("../controllers/export");
const isAuth = require("../middlewares/isAuth");

const router = express.Router();
router.post("/export", isAuth.protect, exportController.dataExport);

module.exports = router;
