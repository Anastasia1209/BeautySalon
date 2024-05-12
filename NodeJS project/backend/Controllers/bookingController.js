const { PrismaClient } = require("@prisma/client");
const clientPr = new PrismaClient();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const secret = process.env.ACCESS_TOKEN_SECRET;
const dayjs = require("dayjs");

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

      // Извлекаем идентификаторы мастеров
      const employeeIDs = employees.map((employee) => employee.employeeID);

      // Если нет мастеров, предоставляющих эту услугу
      if (employeeIDs.length === 0) {
        return res
          .status(404)
          .json({ message: "No employees found for the specified service" });
      }

      //  const currentDate = new Date().toISOString().slice(0, 10);

      // Поиск расписаний для мастеров, которые предоставляют данную услугу
      const schedules = await clientPr.schedule.findMany({
        where: {
          employeeID: {
            in: employeeIDs, // Используем массив идентификаторов мастеров
          },
          // date: {
          //   gte: currentDate, // Дата не раньше текущей даты
          // },
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
      //console.log(new Date(date));
      // const test = date.split(".");
      // const test2 = test[2] + "." + test[1] + "." + test[0];
      // console.log(test2);
      console.log(new Date(parseInt(date)));
      const formatDate = new Date(parseInt(date));
      console.log("foramta: " + formatDate);
      // Преобразуем дату в формат Date
      // const test = new Date(
      //   formatDate.setHours(
      //     formatDate.getHours() - formatDate.getTimezoneOffset()
      //   )
      // );

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

      const dateOffset = new Date(date);
      const selectedDate = new Date(
        dateOffset.setHours(
          dateOffset.getHours() - dateOffset.getTimezoneOffset() / 60
        )
      );

      console.log(new Date(startTime));
      // Проверка наличия времени в расписании мастера
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

  //получение инфы
  async getUserRegistrations(req, res) {
    try {
      //   const userID = parseInt(req.params.userID, 10);
      const userID = req.user.userID;

      console.log(userID);
      // Поиск записей о регистрации для конкретного пользователя (userID)
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
              // Включаем информацию об услуге
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

      // Если записей о регистрации не найдено, вернуть пустой массив
      if (!registrations || registrations.length === 0) {
        return res.status(404).json({ message: "Записи на услуги не найдены" });
      }

      // Преобразование данных о регистрации в требуемый формат
      const formattedRegistrations = registrations.map((registration) => ({
        registrationID: registration.registrationID,
        date: registration.dateTime.toISOString().split("T")[0],
        time: registration.dateTime.toISOString().split("T")[1].slice(0, 5),
        service: registration.employee.services[0].service.name,
        employee: `${registration.employee.name} ${registration.employee.surname}`,
      }));

      // Возвращение информации о записях на услуги
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
      // Получаем ID регистрации из запроса
      const { registrationID } = req.params;
      console.log(registrationID);
      // Поиск регистрации по ID
      const registration = await clientPr.registration.findUnique({
        where: {
          registrationID: parseInt(registrationID, 10),
        },
      });

      if (!registration) {
        console.log("Регистрация не найдена");
        return res.status(404).json({ message: "Регистрация не найдена" });
      }
      const selectedDate = new Date(
        registration.dateTime.setHours(
          registration.dateTime.getHours() -
            registration.dateTime.getTimezoneOffset() / 60
        )
      );
      console.log(new Date(selectedDate));
      // Восстанавливаем время в расписании мастера
      await clientPr.schedule.create({
        data: {
          employee: {
            connect: { employeeID: registration.employeeID },
          },
          //  employeeId: registration.employeeID,
          // date: registration.dateTime,
          date: selectedDate,

          startTime: registration.dateTime,
          // endTime: registration.dateTime,
          endTime: dayjs(registration.dateTime).add(1, "hour").toDate(), // Увеличиваем на один час
        },
      });

      // Удаляем регистрацию
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
