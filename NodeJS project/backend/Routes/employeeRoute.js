const express = require("express");
const { check } = require("express-validator");
const jwt = require("jsonwebtoken");
const employeeController = require("../Controllers/employeeController.js");
const checkRole = require("../Middlewares/roleMiddleware.js");
const authController = require("../Controllers/authController.js");
const authMiddleware = require("../Middlewares/authMiddleware.js");

const router = express.Router();

router.get("/getempl", employeeController.getEmployees);
router.get("/getemplbyid/:id", employeeController.getEmployeeById);
router.post(
  "/addempl",
  checkRole("ADMIN"),
  authMiddleware,
  employeeController.addEmployee
);
router.put(
  "/updempl/:id",
  checkRole("ADMIN"),
  authMiddleware,
  employeeController.updateEmployee
);
router.delete(
  "/delempl/:id",
  checkRole("ADMIN"),
  authMiddleware,
  employeeController.delEmployee
);
module.exports = router;
