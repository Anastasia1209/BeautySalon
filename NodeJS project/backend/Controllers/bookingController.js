const { PrismaClient } = require("@prisma/client");
const clientPr = new PrismaClient();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const secret = process.env.ACCESS_TOKEN_SECRET;

// function convertDateToISO(dateString) {
//   // Создаем объект даты из строки в формате YYYY-MM-DD
//   const date = new Date(dateString);

//   // Устанавливаем время на начало дня (00:00:00.000 UTC)
//   date.setUTCHours(0, 0, 0, 0);

//   // Преобразуем дату в формат ISO 8601
//   return date.toISOString();
// }

class bookingController {
  async getAvailableDatesForService(req, res) {
    try {
      // Извлекаем идентификатор услуги из параметров или query
      // const serviceID = req.query.serviceID;
      const { serviceID } = req.params;

      // Проверяем, что `serviceID` определен
      if (!serviceID) {
        return res.status(400).json({ message: "Service ID is required" });
      }

      // Поиск мастеров, которые предоставляют данную услугу
      const employees = await clientPr.employees.findMany({
        where: {
          services: {
            some: {
              serviceID: parseInt(serviceID, 10),
            },
          },
        },
        select: {
          employeeID: true,
        },
      });

      // Извлекаем идентификаторы мастеров
      const employeeIDs = employees.map((employee) => employee.employeeID);

      // Если нет мастеров, предоставляющих эту услугу
      if (employeeIDs.length === 0) {
        return res
          .status(404)
          .json({ message: "No employees found for the specified service" });
      }

      // Поиск расписаний для мастеров, которые предоставляют данную услугу
      const schedules = await clientPr.schedule.findMany({
        where: {
          employeeID: {
            in: employeeIDs, // Используем массив идентификаторов мастеров
          },
        },
        select: {
          date: true, // Выбираем только дату
        },
        distinct: ["date"], // Используем distinct для уникальности дат
      });

      // Извлекаем уникальные даты
      const uniqueDates = schedules.map((schedule) => schedule.date);

      // Возвращаем список уникальных дат
      res.status(200).json({
        message: "Available dates retrieved successfully",
        dates: uniqueDates,
      });
    } catch (error) {
      console.error("Error retrieving available dates for service:", error);
      res
        .status(500)
        .json({ message: "Error retrieving available dates for service" });
    }
  }

  async getTimeSlotsForDate(req, res) {
    try {
      // Извлекаем дату из запроса
      const { date } = req.params;
      console.log("data");
      console.log(date);
      // Если дата не указана, возвращаем ошибку
      if (!date) {
        return res.status(400).json({ message: "Date parameter is required" });
      }

      // Преобразуем дату в формат Date
      const selectedDate = new Date(date);

      // Поиск всех временных слотов на заданную дату
      const timeSlots = await clientPr.schedule.findMany({
        where: {
          date: selectedDate,
        },
      });

      // Возвращаем найденные временные слоты в ответ
      res.status(200).json({
        message: "Time slots retrieved successfully",
        date: selectedDate.toISOString().split("T")[0],
        timeSlots: timeSlots,
      });
    } catch (error) {
      console.error("Error retrieving time slots:", error);
      res.status(500).json({ message: "Error retrieving time slots" });
    }
  }

  async getEmployeesAndTimeForDate(req, res) {
    try {
      // Получаем `serviceID` и `date` из запроса
      const { serviceID, date } = req.params;

      // Проверка, что `serviceID` и `date` предоставлены
      if (!serviceID || !date) {
        return res
          .status(400)
          .json({ message: "Service ID and date are required" });
      }

      // Найти сотрудников, предоставляющих данную услугу
      const employees = await clientPr.employees.findMany({
        where: {
          services: {
            some: {
              serviceID: parseInt(serviceID, 10),
            },
          },
        },
        select: {
          employeeID: true,
          name: true,
          surname: true,
        },
      });

      // Если нет сотрудников, возвращаем пустой список
      if (employees.length === 0) {
        return res.status(200).json({ employees: [] });
      }

      // Получаем расписание для каждого сотрудника на выбранную дату
      const employeesWithTime = await Promise.all(
        employees.map(async (employee) => {
          // Получаем расписание для текущего сотрудника
          const schedule = await clientPr.schedule.findMany({
            where: {
              employeeID: employee.employeeID,
              date: new Date(date),
            },
          });

          return {
            ...employee,
            schedule, // Добавляем расписание к сотруднику
          };
        })
      );

      // Возвращаем сотрудников и их расписание
      res.status(200).json({ employees: employeesWithTime });
    } catch (error) {
      console.error("Error retrieving employees and time for date:", error);
      res
        .status(500)
        .json({ message: "Error retrieving employees and time for date" });
    }
  }

  ///
  async addRegistration(req, res) {
    try {
      // Проверка входных данных
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("Неверно введены данные");
        return res
          .status(400)
          .json({ message: "Неверно введены данные", errors });
      }

      const { userID, employeeID, date, startTime, notes } = req.body;

      if (!userID || !employeeID || !date || !startTime) {
        console.log("Все поля должны быть заполнены");
        return res
          .status(400)
          .json({ message: "Все поля должны быть заполнены" });
      }

      // Проверка наличия времени в расписании мастера
      const availableSchedule = await clientPr.schedule.findFirst({
        where: {
          employeeID,
          date: new Date(date),
          startTime: new Date(startTime),
        },
      });

      if (!availableSchedule) {
        console.log("Время недоступно");
        return res.status(400).json({ message: "Время недоступно" });
      }

      // Создание новой записи в таблице Registration
      const newRegistration = await clientPr.registration.create({
        data: {
          userID,
          employeeID,
          dateTime: startTime,
          notes,
        },
      });

      // Удаляем время из расписания мастера
      await clientPr.schedule.delete({
        where: {
          scheduleID: availableSchedule.scheduleID,
        },
      });

      res.status(201).json({
        message: "Регистрация успешно добавлена",
        registration: newRegistration,
      });
      console.log("Регистрация успешно добавлена");
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: "Ошибка при добавлении регистрации" });
    }
  }

  async cancelRegistration(req, res) {
    try {
      // Получаем ID регистрации из запроса
      const { registrationId } = req.params;

      // Поиск регистрации по ID
      const registration = await clientPr.registration.findUnique({
        where: {
          registrationId: parseInt(registrationId, 10),
        },
      });

      if (!registration) {
        console.log("Регистрация не найдена");
        return res.status(404).json({ message: "Регистрация не найдена" });
      }

      // Восстанавливаем время в расписании мастера
      await clientPr.schedule.create({
        data: {
          employeeId: registration.employeeID,
          date: registration.dateTime,
          startTime: registration.dateTime,
          endTime: registration.dateTime, // Вам может понадобиться настроить длительность
        },
      });

      // Удаляем регистрацию
      await clientPr.registration.delete({
        where: {
          registrationId: registration.registrationID,
        },
      });

      res.status(200).json({
        message: "Регистрация успешно отменена",
      });
      console.log("Регистрация успешно отменена");
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: "Ошибка при отмене регистрации" });
    }
  }
}

module.exports = new bookingController();
