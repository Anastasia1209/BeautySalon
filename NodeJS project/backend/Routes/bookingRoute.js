const express = require("express");
//const Router = require('express');
//const AuthValidator = require("../Validators/auth.js");
const jwt = require("jsonwebtoken");

const authMiddleware = require("../Middlewares/authMiddleware.js");
const roleMiddleware = require("../Middlewares/roleMiddleware.js");
const bookingController = require("../Controllers/bookingController.js");

const router = express.Router();

router.get("/getslots/:date", bookingController.getTimeSlotsForDate);
router.get(
  "/getdate/:serviceID",
  bookingController.getAvailableDatesForService
);
router.get(
  "/getemployees/:serviceID/:date",
  bookingController.getEmployeesAndTimeForDate
);

router.post("/booking", bookingController.addRegistration);
module.exports = router;
