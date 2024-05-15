const { PrismaClient } = require("@prisma/client");
const clientPr = new PrismaClient();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const secret = process.env.ACCESS_TOKEN_SECRET;

const generateAccessToken = (userID, role) => {
  console.log(userID + "     " + role);
  const payload = {
    userID,
    role,
  };

  return jwt.sign(payload, secret, {
    expiresIn: "1h",
  });
};

class authController {
  async registration(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("Неверно введены данные");

        return res
          .status(400)
          .json({ message: "Неверно введены данные", errors });
      }
      const { name, phone, email, password, role } = req.body;

      if (!name || !phone || !email || !password) {
        console.log("All fields are required");

        return res
          .status(400)
          .json({ message: "Все поля должны быть заполнены" });
      }

      const existingUser = await clientPr.users.findUnique({
        where: { email },
      });
      if (existingUser) {
        console.log("Email уже используется");
        return res.status(409).json({ message: "Email уже используется" });
      }

      // Захеширован пароль
      const hashedPassword = await bcrypt.hash(password, 5);

      const userRole =
        role && role.toUpperCase() === "ADMIN" ? "ADMIN" : "USER";

      //новый мользователь
      const newUser = await clientPr.users.create({
        data: {
          name,
          phone,
          email,
          password: hashedPassword,
          role: userRole,
        },
      });
      res.status(201).json({
        message: "User зарегистрирован успешно",
        user: {
          userID: newUser.userID,
          name: newUser.name,
          phone: newUser.phone,
          email: newUser.email,
          role: newUser.role,
        },
      });
      console.log("User зарегистрирован успешно");
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: "Ошибка регистрации" });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await clientPr.users.findUnique({
        where: { email },
      });
      const isPasswordValid = bcrypt.compareSync(password, user.password);

      if (!user || !isPasswordValid) {
        console.log("Неверный логин или пароль");
        return res.status(401).json({ message: "Неверный логин или пароль" });
      }

      const token = generateAccessToken(user.userID, user.role);
      console.log("---------------------");
      console.log("userID ", user.userID);
      return res.json({ token });
    } catch (error) {
      // next(error);
      console.log(error);
      res.status(400).json({ message: "Ошибка входа" });
    }
  }

  async getUserData(req, res) {
    try {
      const { userID } = req.user;

      console.log("userID", userID);

      const user = await clientPr.users.findFirst({
        where: {
          userID: userID,
        },
      });

      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }

      return res.json({
        userID: user.userID,
        name: user.name,
        phone: user.phone,
        email: user.email,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Ошибка сервера" });
    }
  }

  async currentUser(req, res) {
    try {
      const userId = req.user.userID;

      console.log("User ID from token:", userId);

      const user = await clientPr.users.findFirst({
        where: {
          userID: userId,
        },
      });

      if (!user) {
        return res.status(404).json({ message: "User не найден" });
      }

      return res.json(user);
    } catch (error) {
      console.error("Ошибка получения пользователя:", error);
      res.status(500).json({ message: "Ошибка получения пользователя" });
    }
  }

  async updateUser(req, res) {
    const userId = parseInt(req.params.id, 10);

    const existingUser = await clientPr.users.findFirst({
      where: {
        userID: userId,
      },
    });

    if (!existingUser) {
      console.log("Пользователь не найден");
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    const { name, phone, email } = req.body;

    if (!name || !phone || !email) {
      console.log("Все поля должны быть заполнены");
      return res
        .status(400)
        .json({ message: "Все поля должны быть заполнены" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("Некорректный email");
      return res.status(400).json({ message: "Некорректный email" });
    }

    const updateData = {
      name,
      phone,
      email,
    };

    try {
      const updatedUser = await clientPr.users.update({
        where: {
          userID: userId,
        },
        data: updateData,
      });

      console.log("Пользователь успешно обновлен");
      res.status(200).json({
        message: "Пользователь успешно обновлен",
        user: {
          id: updatedUser.userID,
          name: updatedUser.name,
          phone: updatedUser.phone,
          email: updatedUser.email,
        },
      });
    } catch (error) {
      console.log("Ошибка обновления пользователя");
      console.error("Ошибка обновления пользователя: ", error);
      res.status(500).json({ message: "Ошибка обновления пользователя" });
    }
  }

  async deleteUser(req, res) {
    try {
      const userId = parseInt(req.params.id, 10);

      const existingUser = await clientPr.users.findUnique({
        where: {
          userID: userId,
        },
      });

      if (!existingUser) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }

      await clientPr.users.delete({
        where: {
          userID: userId,
        },
      });

      res.status(200).json({ message: "User удален успешно" });
    } catch (error) {
      console.error("Ошибка удаления пользователя:", error);
      res.status(500).json({ message: "Ошибка удаления пользователя" });
    }
  }

  async logOut(req, res) {
    try {
      res.clearCookie("authToken");
      res.status(200).json({ message: "Logout успешно" });
    } catch (e) {
      console.error(e);
      res.status(400).json({ message: "Ошибка logout" });
    }
  }
  async;
}

module.exports = new authController();
