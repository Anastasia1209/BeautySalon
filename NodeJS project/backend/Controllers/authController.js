const { PrismaClient } = require("@prisma/client");
const clientPr = new PrismaClient();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const secret = process.env.ACCESS_TOKEN_SECRET;

const generateAccessToken = (id, role) => {
  console.log(id + " fffff " + role);
  const payload = {
    id,
    role,
  };

  console.log("payload^ " + payload);
  return jwt.sign(payload, secret, {
    expiresIn: "1h",
  });
};

class authController {
  async registration(req, res) {
    // const { fingerprint } = req;
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("Ошибка при регистрации");

        return res
          .status(400)
          .json({ message: "Ошибка при регистрации", errors });
      }
      const { name, phone, email, password, role } = req.body;

      if (!name || !phone || !email || !password) {
        console.log("All fields are required");

        return res.status(400).json({ message: "All fields are required" });
      }

      const existingUser = await clientPr.users.findUnique({
        where: { email },
      });
      if (existingUser) {
        console.log("Email already exists");
        return res.status(409).json({ message: "Email already exists" });
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
      //данные о пользователе
      res.status(201).json({
        message: "User registered successfully",
        user: {
          id: newUser.id,
          name: newUser.name,
          phone: newUser.phone,
          email: newUser.email,
          role: newUser.role,
        },
      });
      console.log("User registered successfully");
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: "Registration error" });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await clientPr.users.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(401).json({ message: "User is not found" });
      }

      const isPasswordValid = bcrypt.compareSync(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid password" });
      }

      // const accessToken = jwt.sign({id: user.id}, process.env.ACCESS_TOKEN_SECRET);
      //res.cookie("accessToken", accessToken);
      // res.end();
      //console.log(user.userID + " fffff " + user.role);
      //вопросики с ролями и так ли айди
      const token = generateAccessToken(user.userID, user.role);
      return res.json({ token });
    } catch (error) {
      // next(error);
      console.log(error);
      res.status(400).json({ message: "Login error" });
    }
  }

  async getUserById(req, res) {
    try {
      // Извлечение ID из запроса
      const id = parseInt(req.query.id);
      if (!Number.isInteger(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      // Извлечение токена из заголовка
      const authorizationHeader = req.headers.authorization;
      if (!authorizationHeader) {
        return res.status(401).json({ message: "You are not authorized" });
      }

      const tokenArray = authorizationHeader.split(" ");
      if (tokenArray.length === 2) {
        const token = tokenArray[1];
        let decodedToken;
        try {
          decodedToken = jwt.verify(token, secret);
        } catch (err) {
          return res.status(401).json({ message: "Invalid token" });
        }

        // Сравнение ID пользователя из токена с ID из запроса
        const userIdFromToken = decodedToken.id;
        if (userIdFromToken !== id) {
          return res.status(403).json({ message: "Forbidden" });
        }

        // Получение данных о пользователе из базы данных
        const user = await clientPr.users.findFirst({
          where: {
            userID,
          },
        });

        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        // Возврат данных о пользователе
        return res.json(user);
      }
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: "User error" });
    }
  }
  /*
  async currentUser(req, res) {
    try {
      // проверка, что пользователь авторизован:
      const authorizationHeader = req.headers.authorization;
      if (!authorizationHeader) {
        return res.status(401).json("You are not authorized");
      }
      if (authorizationHeader) {
        const tokenArray = authorizationHeader.split(" ");
        if (tokenArray.length === 2) {
          const token = tokenArray[1];
          let decodedToken;
          try {
            decodedToken = jwt.verify(token, secret);
            console.log("adasdasdasdsa " + decodedToken);
          } catch (err) {
            return res.status(401).json({ message: "Invalid token" });
          }
          const id = decodedToken.id;
          console.log("uuuuuuuuuuuuuuuu");
          console.log(decodedToken);

          const user = await clientPr.users.findFirst({
            where: {
              userID: id,
            },
          });
          return res.json(user);
        }
      }
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: "Get user error" });
    }
  }
*/
  async currentUser(req, res) {
    try {
      // Используйте данные о пользователе из `req.user`, установленного middleware
      const userId = req.user.userID; // Или `req.user.id`, если вы используете этот ключ в `decodedData`

      // Извлечение пользователя из базы данных по его ID
      const user = await clientPr.users.findFirst({
        where: {
          userID: userId,
        },
      });

      // Проверка существования пользователя
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Возврат данных о пользователе
      return res.json(user);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Get user error" });
    }
  }

  async updateUser(req, res) {
    // Извлечение идентификатора пользователя из параметров маршрута
    const userId = parseInt(req.params.id, 10);

    // Проверка существования пользователя
    const existingUser = await clientPr.users.findFirst({
      where: {
        userID: userId,
      },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    const { name, phone, email, password, role } = req.body;

    const updateData = {};

    if (name !== undefined) {
      updateData.name = name;
    }

    if (phone !== undefined) {
      updateData.phone = phone;
    }

    if (email !== undefined) {
      updateData.email = email;
    }

    if (password !== undefined) {
      const hashedPassword = await bcrypt.hash(password, 5);
      updateData.password = hashedPassword;
    }
    // Проверяем, есть ли данные для обновления
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "Нет данных для обновления" });
    }
    try {
      // Выполнение обновления пользователя в базе данных
      const updatedUser = await clientPr.users.update({
        where: {
          userID: userId,
        },
        data: updateData,
      });

      // Возврат обновленных данных о пользователе
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
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Error updating user" });
    }
  }

  /*
  async updateUser(req, res) {
    try {
      const authorizationHeader = req.headers.authorization;
      if (authorizationHeader) {
        const tokenArray = authorizationHeader.split(" ");
        if (tokenArray.length === 2) {
          const token = tokenArray[1];
          let decodedToken;
          try {
            decodedToken = jwt.verify(token, secret);
          } catch (err) {
            return res.status(401).json({ message: "Invalid token" });
          }
          const roles = decodedToken.roles;
          if (!roles.includes("ADMIN")) {
            return res.status(403).json("You don't have enough rights");
          }
          const id = parseInt(req.query.id);
          if (!Number.isInteger(id)) {
            return res.status(400).json({ message: "Invalid user ID" });
          }
          const user = await clientPr.users.findUnique({
            where: {
              id,
            },
          });
          if (!user) {
            return res.status(404).json({ message: "User not found" });
          }
          const { name, email, role } = req.body;
          const existingUser = await clientPr.users.findUnique({
            where: {
              email,
            },
          });
          if (existingUser && existingUser.id !== id) {
            // Return an error response if the category already exists
            return res.status(409).send("User with this email already exists");
          }
          const userNew = await clientPr.users.update({
            where: {
              id: Number(id),
            },
            data: {
              ...req.body,
            },
          });
          return res.json(userNew);
        }
      }
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: "User error" });
    }
  }
*/

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

      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Error deleting user" });
    }
  }

  async logOut(req, res) {
    try {
      res.clearCookie("authToken");

      // Отправляем успешный ответ о выходе из аккаунта
      res.status(200).json({ message: "Logged out successfully" });
      //   });
    } catch (e) {
      console.error(e);
      res.status(400).json({ message: "Error logout" });
    }
  }
  async;
}

module.exports = new authController();
