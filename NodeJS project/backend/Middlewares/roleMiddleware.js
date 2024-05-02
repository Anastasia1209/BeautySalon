const jwt = require("jsonwebtoken");
const secret = process.env.ACCESS_TOKEN_SECRET;

module.exports = function (role) {
  return function (req, res, next) {
    if (req.method === "OPTIONS") {
      next();
    }

    try {
      const token = req.headers.authorization.split(" ")[1];
      console.log(token);
      if (!token) {
        console.log("Пользователь не авторизован");
        return res.status(403).json({ message: "Пользователь не авторизован" });
      }

      const decoded = jwt.verify(token, secret);
      if (decoded.role !== role) {
        console.log("Нет доступа к выполнению операции");
        return res
          .status(403)
          .json({ message: "Нет доступа к выполнению операции" });
      }
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: "Не авторизован" });
      console.log("Не авторизован");
    }
  };
};

/*
module.exports = function (roles) {
  return function (req, res, next) {
    if (req.method === "OPTIONS") {
      next();
    }

    try {
      const token = req.headers.authorization.split(" ")[1];
      console.log(token);
      if (!token) {
        return res.status(403).json({ message: "Пользователь не авторизован" });
      }

      const { roles: userRoles } = jwt.verify(token, secret).role;
      //console.log(userRoles);
      console.log("sssssssssss");

      if (!userRoles) {
        return res.status(403).json({ message: "Пользователь не авторизован" });
      }

      let hasRole = false;
      userRoles.forEach((role) => {
        if (roles.includes(role)) {
          hasRole = true;
        }
      });
      if (!hasRole) {
        return res.status(403).json({ message: "У вас нет доступа" });
      }
      next();
    } catch (error) {
      console.log(error);
      return res.status(403).json({ message: "Пользователь не авторизован" });
    }
  };
};
*/
/*
module.exports = function (requiredRoles) {
  return function (req, res, next) {
    // Разрешение запросов OPTIONS
    if (req.method === "OPTIONS") {
      return next();
    }

    try {
      // Извлечение токена из заголовка Authorization
      const authHeader = req.headers.authorization;

      // Проверка существования заголовка Authorization
      if (!authHeader) {
        return res
          .status(403)
          .json({ message: "Пользователь не авторизован, нет заголовка" });
      }

      // Извлечение токена из заголовка Authorization
      const token = authHeader.split(" ")[1];

      // Проверка существования токена
      if (!token) {
        return res
          .status(403)
          .json({ message: "Пользователь не авторизован, нет токена" });
      }

      // Проверка и извлечение данных из токена
      const decodedToken = jwt.verify(token, secret);
      const userRoles = decodedToken.roles;

      // Проверка существования ролей пользователя
      if (!userRoles) {
        return res
          .status(403)
          .json({ message: "Пользователь не авторизован, что с ролями" });
      }

      // Проверка наличия хотя бы одной необходимой роли у пользователя
      const hasRequiredRole = requiredRoles.some((role) =>
        userRoles.includes(role)
      );
      if (!hasRequiredRole) {
        return res.status(403).json({ message: "У вас нет доступа" });
      }

      // Если все проверки прошли успешно, передача управления следующему middleware
      next();
    } catch (error) {
      // Логирование ошибки и отправка ответа с ошибкой
      console.error("Ошибка при проверке токена:", error);
      return res.status(403).json({ message: "Пользователь не авторизован" });
    }
  };
};
*/
