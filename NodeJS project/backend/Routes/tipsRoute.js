const express = require("express");
const { check } = require("express-validator");
const jwt = require("jsonwebtoken");
const serviceController = require("../Controllers/serviceController.js");
const checkRole = require("../Middlewares/roleMiddleware.js");
const authMiddleware = require("../Middlewares/authMiddleware.js");
const tipsController = require("../Controllers/tipsController.js");

const router = express.Router();
router.post(
  "/addtips",
  authMiddleware,
  checkRole("ADMIN"),
  tipsController.addTip
);
router.get("/gettips", authMiddleware, tipsController.getRandomTip);

module.exports = router;
