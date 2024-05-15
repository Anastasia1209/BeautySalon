const express = require("express");
//const Router = require('express');
//const AuthValidator = require("../Validators/auth.js");
const jwt = require("jsonwebtoken");

const authMiddleware = require("../Middlewares/authMiddleware.js");
const roleMiddleware = require("../Middlewares/roleMiddleware.js");
const bookingController = require("../Controllers/bookingController.js");

const { getAllRegistrations } = require("../ws.js");

const router = express.Router();

router.get(
  "/getslots/:date",
  authMiddleware,
  bookingController.getTimeSlotsForDate
);
router.get(
  "/getdate/:serviceID",
  authMiddleware,
  bookingController.getAvailableDatesForService
);
router.get(
  "/getemployees/:serviceID/:date",
  authMiddleware,
  bookingController.getEmployeesAndTimeForDate
);

router.post("/booking", authMiddleware, bookingController.addRegistration);
router.get("/getbook", authMiddleware, bookingController.getUserRegistrations);

router.delete(
  "/delbook/:registrationID",
  authMiddleware,
  bookingController.cancelRegistration
);

//тест
router.get("/getallreg", getAllRegistrations);

module.exports = router;
