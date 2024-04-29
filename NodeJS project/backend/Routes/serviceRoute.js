const express = require("express");
const { check } = require("express-validator");
const jwt = require("jsonwebtoken");
const serviceController = require("../Controllers/serviceController.js");
const checkRole = require("../Middlewares/roleMiddleware.js");

const router = express.Router();

router.post(
  "/addservice",
  [
    check("name", "Заполните поле").notEmpty(),
    check("decription", "Заполните поле").notEmpty(),
    check("price", "Заполните поле").notEmpty(),
  ],
  checkRole("ADMIN"),
  serviceController.addService
);
router.get("/getservices", serviceController.getServices);
router.get("/getservbyid/:id", serviceController.getServById);
router.put("/updserv/:id", checkRole("ADMIN"), serviceController.updServ);
router.delete("/delserv/:id", checkRole("ADMIN"), serviceController.delServ);
module.exports = router;
