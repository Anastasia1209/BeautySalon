const { PrismaClient } = require("@prisma/client");
const clientPr = new PrismaClient();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const secret = process.env.ACCESS_TOKEN_SECRET;
const dayjs = require("dayjs");

class bookingController {
  async getAvailableDatesForService(req, res) {
    try {
      const { serviceID } = req.params;

      if (!serviceID) {
        return res
          .status(400)
          .json({ message: "Требуется идентификатор услуги" });
      }

      const employees = await clientPr.employees.findMany({
        where: {
          services: {
            some: {
              serviceID: parseInt(serviceID, 10),
            },
          },
          schedules: {
            some: {
              date: {
                gte: new Date(),
              },
            },
          },
        },
        select: {
          employeeID: true,
        },
      });

      const employeeIDs = employees.map((employee) => employee.employeeID);

      if (employeeIDs.length === 0) {
        return res
          .status(404)
          .json({ message: "Сотрудников для указанной услуги не найдено" });
      }

      const schedules = await clientPr.schedule.findMany({
        where: {
          employeeID: {
            in: employeeIDs,
          },
          // date: {
          //   gte: currentDate, // Дата не раньше текущей даты
          // },
        },
        select: {
          date: true,
          у,
        },
        distinct: ["date"], //  distinct для уникальности дат
      });

      const uniqueDates = schedules.map((schedule) => schedule.date);

      res.status(200).json({
        message: "Доступные даты успешно получены.",
        dates: uniqueDates,
      });
    } catch (error) {
      console.error("Ошибка при получении доступных дат:", error);
      res.status(500).json({ message: "Ошибка при получении доступных дат" });
    }
  }

  async getTimeSlotsForDate(req, res) {
    try {
      const { date } = req.params;
      console.log("data");
      console.log(date);
      if (!date) {
        return res.status(400).json({ message: "Требуется параметр даты" });
      }
      //console.log(new Date(date));
      // const test = date.split(".");
      // const test2 = test[2] + "." + test[1] + "." + test[0];
      // console.log(test2);
      console.log(new Date(parseInt(date)));
      const formatDate = new Date(parseInt(date));
      console.log("foramta: " + formatDate);

      console.log(formatDate.getTimezoneOffset());
      console.log(formatDate.getHours());

      const selectedDate = new Date(
        formatDate.setHours(
          formatDate.getHours() - formatDate.getTimezoneOffset() / 60
        )
      );
      console.log(formatDate);
      console.log(selectedDate);
      // Поиск всех временных слотов на заданную дату
      const timeSlots = await clientPr.schedule.findMany({
        where: {
          date: selectedDate,
        },
      });

      res.status(200).json({
        message: "Time slots успешно получены",
        date: selectedDate.toISOString().split("T")[0],
        timeSlots: timeSlots,
      });
    } catch (error) {
      console.error("Ошибка получения time slots:", error);
      res.status(500).json({ message: "Ошибка получения time slots" });
    }
  }

  async getEmployeesAndTimeForDate(req, res) {
    try {
      const { serviceID, date } = req.params;

      if (!serviceID || !date) {
        return res
          .status(400)
          .json({ message: "Требуется идентификатор услуги и дата." });
      }

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

      if (employees.length === 0) {
        return res.status(200).json({ employees: [] });
      }

      const employeesWithTime = await Promise.all(
        employees.map(async (employee) => {
          const schedule = await clientPr.schedule.findMany({
            where: {
              employeeID: employee.employeeID,
              date: new Date(date),
            },
          });

          return {
            ...employee,
            schedule, // расписание к сотруднику
          };
        })
      );

      res.status(200).json({ employees: employeesWithTime });
    } catch (error) {
      console.error(
        "Ошибка при получении данных о сотрудниках и времени: ",
        error
      );
      res.status(500).json({
        message: "Ошибка при получении данных о сотрудниках и времени",
      });
    }
  }

  ///
  async addRegistration(req, res) {
    try {
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

      const dateOffset = new Date(date);
      const selectedDate = new Date(
        dateOffset.setHours(
          dateOffset.getHours() - dateOffset.getTimezoneOffset() / 60
        )
      );

      console.log(new Date(startTime));
      const availableSchedule = await clientPr.schedule.findFirst({
        where: {
          employeeID,
          date: selectedDate,
          startTime: new Date(startTime),
        },
      });

      if (!availableSchedule) {
        console.log("Время недоступно");
        return res.status(400).json({ message: "Время недоступно" });
      }

      const newRegistration = await clientPr.registration.create({
        data: {
          userID,
          employeeID,
          dateTime: startTime,
          notes,
        },
      });

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

  //получение инфы
  async getUserRegistrations(req, res) {
    try {
      const userID = req.user.userID;

      console.log(userID);
      const registrations = await clientPr.registration.findMany({
        where: {
          userID: userID,
          dateTime: {
            gte: new Date(), // Фильтр для отбора записей не позднее текущего времени
          },
        },
        include: {
          employee: {
            include: {
              services: {
                include: {
                  service: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!registrations || registrations.length === 0) {
        return res.status(404).json({ message: "Записи на услуги не найдены" });
      }

      const formattedRegistrations = registrations.map((registration) => ({
        registrationID: registration.registrationID,
        date: registration.dateTime.toISOString().split("T")[0],
        time: registration.dateTime.toISOString().split("T")[1].slice(0, 5),
        service: registration.employee.services[0].service.name,
        employee: `${registration.employee.name} ${registration.employee.surname}`,
      }));

      res.status(200).json({
        message: "Информация о записях на услуги получена успешно",
        registrations: formattedRegistrations,
      });
    } catch (error) {
      console.error(
        "Ошибка при получении информации о записях на услуги:",
        error
      );
      res.status(500).json({
        message: "Ошибка при получении информации о записях на услуги",
      });
    }
  }

  async cancelRegistration(req, res) {
    try {
      const { registrationID } = req.params;
      console.log(registrationID);
      const registration = await clientPr.registration.findUnique({
        where: {
          registrationID: parseInt(registrationID, 10),
        },
      });

      if (!registration) {
        console.log("Регистрация не найдена");
        return res.status(404).json({ message: "Регистрация не найдена" });
      }
      console.log("regStart: ");
      console.log(registration.dateTime);

      console.log("regSec: ");
      console.log(registration.dateTime);

      const dateCopy = registration.dateTime;

      const startTime = registration.dateTime;
      const setDate = new Date(
        new Date(new Date(dateCopy).setHours(3)).setMinutes(0)
      );
      //const setStartTime = new Date();

      console.log("setDate: ");
      console.log(setDate);

      console.log("startTime: ");
      console.log(startTime);

      console.log();
      await clientPr.schedule.create({
        data: {
          employee: {
            connect: { employeeID: registration.employeeID },
          },
          //  employeeId: registration.employeeID,
          // date: registration.dateTime,
          date: setDate,

          startTime: new Date(registration.dateTime),
          // endTime: registration.dateTime,
          endTime: new Date(startTime.setHours(startTime.getHours() + 1)), // Увеличиваем на один час
        },
      });

      await clientPr.registration.delete({
        where: {
          registrationID: registration.registrationID,
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
