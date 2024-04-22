const express = require("express");
//const Router = require('express');
const AuthController = require("../Controllers/authController.js");
//const AuthValidator = require("../Validators/auth.js");
const { check } = require("express-validator");
const authMiddleware = require("../Middlewares/authMiddleware.js");
const roleMiddleware = require("../Middlewares/roleMiddleware.js");
const authController = require("../Controllers/authController.js");

const router = express.Router();

router.get("/users", roleMiddleware(["ADMIN"]), AuthController.getUsers);
router.get("/user", authController.getUserById);
router.get("/currentUser", authController.currentUser);
router.post(
  "/registration",
  [
    check("name", "Имя пользователя не может быть пустым")
      .notEmpty()
      .isLength({ min: 2, max: 15 }),
    check("phone", "Введите номер телефона").notEmpty(),
    check("email", "Введите правильный email").notEmpty().isEmail(),
    check("password", "Пароль должен быть 8 символов")
      .notEmpty()
      .isLength({ min: 7, max: 9 }),
  ],
  AuthController.registration
);
router.post(
  "/login",
  [check("email", "Введите правильный email").notEmpty().isEmail()],
  AuthController.login
);
router.post("/logout", AuthController.logOut);
//router.post("/refresh", AuthValidator.refresh, AuthController.refresh);

module.exports = router;
