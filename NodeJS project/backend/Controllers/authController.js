const { PrismaClient } = require("@prisma/client");
const clientPr = new PrismaClient();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { secret } = require("../config");

const generateAccessToken = (id, role) => {
  const payload = {
    id,
    role,
  };
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });
};

class authController {
  async registration(req, res) {
    // const { fingerprint } = req;
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ message: "Ошибка при регистрации", errors });
      }
      const { name, phone, email, password } = req.body;

      if (!name || !phone || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const existingUser = await clientPr.users.findUnique({
        where: { email },
      });
      if (existingUser) {
        return res.status(409).json({ message: "Email already exists" });
      }

      // Захеширован пароль
      const hashedPassword = await bcrypt.hash(password, 5);

      //новый мользователь
      const newUser = await clientPr.users.create({
        data: {
          name,
          phone,
          email,
          password: hashedPassword,
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
        },
      });
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

      //вопросики с ролями и так ли айди
      const token = generateAccessToken(user.id, user.role);
      return res.json({ token });
    } catch (error) {
      // next(error);
      console.log(error);
      res.status(400).json({ message: "Login error" });
    }
  }

  async getUsers(req, res) {
    try {
      const authorizationHeader = req.headers.authorization;
      if (authorizationHeader) {
        const tokenArray = authorizationHeader.split(" ");
        if (tokenArray.length === 2) {
          const token = tokenArray[1];
          let decodedToken;
          try {
            decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
          } catch (err) {
            return res.status(401).json("Invalid token");
          }
          const roles = decodedToken.roles;
          if (!roles.includes("ADMIN")) {
            return res.status(403).json("You don't have enough rights");
          }

          const users = await clientPr.users.findMany();
          res.json(users);
          // res.json("ok");
        }
      }
    } catch (e) {
      console.error(e);
      res.status(400).json({ message: "Error get user" });
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
          decodedToken = jwt.verify(token, process.env.SECRET);
        } catch (err) {
          return res.status(401).json({ message: "Invalid token" });
        }

        // Сравнение ID пользователя из токена с ID из запроса
        const userIdFromToken = decodedToken.id;
        if (userIdFromToken !== id) {
          return res.status(403).json({ message: "Forbidden" });
        }

        // Получение данных о пользователе из базы данных
        const user = await clientPr.users.findUnique({
          where: {
            id,
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
            decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
          } catch (err) {
            return res.status(401).json({ message: "Invalid token" });
          }
          const id = decodedToken.id;
          const user = await clientPr.users.findUnique({
            where: {
              id: id,
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

  async updateUser(req, res) {
    try {
      const authorizationHeader = req.headers.authorization;
      if (authorizationHeader) {
        const tokenArray = authorizationHeader.split(" ");
        if (tokenArray.length === 2) {
          const token = tokenArray[1];
          let decodedToken;
          try {
            decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
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
