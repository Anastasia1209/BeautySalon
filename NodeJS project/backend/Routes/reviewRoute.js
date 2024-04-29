const express = require("express");
const { check } = require("express-validator");
const jwt = require("jsonwebtoken");

const reviewController = require("../Controllers/reviewController.js");
const authMiddleware = require("../Middlewares/authMiddleware.js");

const router = express.Router();

router.post("/addreview", authMiddleware, reviewController.addReview);
router.get(
  "/getrewempl/:id",
  authMiddleware,
  reviewController.getReviewsByEmployee
);
router.delete("/delreview", authMiddleware, reviewController.delReview);

module.exports = router;
