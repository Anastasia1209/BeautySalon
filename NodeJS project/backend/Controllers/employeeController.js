const express = require("express");
const { PrismaClient } = require("@prisma/client");
const clientPr = new PrismaClient();
const dayjs = require("dayjs");
require("dayjs/plugin/utc");
require("dayjs/plugin/timezone");
dayjs.extend(require("dayjs/plugin/utc"));
dayjs.extend(require("dayjs/plugin/timezone"));

function convertToISO(date, time) {
  const dateTimeString = `${date}T${time}:00Z`;
  const dateTime = dayjs(dateTimeString);
  return dateTime.toISOString();
}

class employeeController {
  //получение списка сотрудников
  async getEmployees(req, res) {
    try {
      const employees = await clientPr.employees.findMany({
        include: {
          services: {
            include: {
              service: true, // Включаем данные об услугах
            },
          },
        },
      });
      const employeeWithId = employees.map((employee) => ({
        id: employee.employeeID,
        name: employee.name,
        surname: employee.surname,
        phone: employee.phone,
        email: employee.email,
        services: employee.services.map(
          (empService) => empService.service.name
        ),
      }));

      res.status(200).json(employeeWithId);
    } catch (error) {
      console.error("Ошибка получения сотрудников:", error);
      res.status(500).json({ message: "Ошибка получения сотрудников" });
    }
  }

  async getEmployeesByService(req, res) {
    try {
      const { serviceID } = req.params;
      const parsedServiceID = parseInt(serviceID, 10);

      console.log(parsedServiceID);

      if (!serviceID) {
        return res
          .status(400)
          .json({ message: "Требуется идентификатор услуги." });
      }

      const employees = await clientPr.employees.findMany({
        where: {
          services: {
            some: {
              serviceID: parsedServiceID,
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
        return res
          .status(404)
          .json({ message: "Сотрудников для указанной услуги не найдено" });
      }

      res.status(200).json({
        message: "Сотрудники получены успешно",
        employees: employees,
      });
    } catch (error) {
      console.error("Ошибка получения сотрудников по сервису: ", error);
      res
        .status(500)
        .json({ message: "Ошибка получения сотрудников по сервису" });
    }
  }

  //////////////////////////////////
  //добавление сотрудника
  async addEmployee(req, res) {
    try {
      const { name, surname, positions, email, services, schedules } = req.body;

      if (!name || !surname || !positions || !email) {
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

      const existingEmployee = await clientPr.employees.findFirst({
        where: {
          email: email,
        },
      });

      if (existingEmployee) {
        console.log("Сотрудник с таким email уже существует");
        return res
          .status(409)
          .json({ message: "Сотрудник с таким email уже существует" });
      }

      const newEmployee = await clientPr.employees.create({
        data: {
          name,
          surname,
          positions,
          email,
          services: {
            create: services.map((serviceID) => ({ serviceID })),
          },
        },
      });

      let error = false;

      schedules.forEach(async (schedule) => {
        const { date, startTime, endTime } = schedule;

        if (new Date(date) < new Date()) {
          error = true;
          console.log("Недопустимая дата");
          return res.status(409).json({ message: "Недействительная дата" });
        }

        if (new Date(startTime) > new Date(endTime)) {
          error = true;
          console.log("Недопустимое время начала и окончания ");
          return res
            .status(409)
            .json({ message: "Недопустимое время начала и окончания" });
        }

        // Добавление расписания для нового сотрудника
        const timeSlots = [];

        ///////////////////////////////////////

        const dateUTC = new Date(date);
        const startTimeUTC = new Date(startTime);
        const endTimeUTC = new Date(endTime);

        const dateLocal = new Date(
          dateUTC.setHours(
            dateUTC.getHours() - dateUTC.getTimezoneOffset() / 60
          )
        );

        const startLocal = new Date(
          new Date(
            startTimeUTC.setHours(
              startTimeUTC.getHours() - startTimeUTC.getTimezoneOffset() / 60
            )
          ).setDate(dateLocal.getDate())
        );

        const endLocal = new Date(
          endTimeUTC.setHours(
            endTimeUTC.getHours() - endTimeUTC.getTimezoneOffset() / 60
          )
        );

        console.log("------------------------------");

        console.log("Date: ", dateLocal);
        console.log("Start time: ", startLocal);
        console.log("End time: ", endLocal);
        console.log("------------------------------");

        while (startLocal.getHours() < endLocal.getHours()) {
          timeSlots.push({
            employeeID: newEmployee.employeeID,
            date: dateLocal,
            startTime: new Date(startLocal),
            endTime: new Date(startLocal.setHours(startLocal.getHours() + 1)),
          });
        }

        new Date(startLocal.setDate(dateLocal.getDate()));
        console.log(timeSlots);
        if (timeSlots.length > 0) {
          await clientPr.schedule.createMany({
            data: timeSlots,
          });
        }
      });

      if (!error) {
        res.status(201).json({
          message: "Сотрудник успешно добавлен",
          employee: newEmployee,
        });
      }
    } catch (error) {
      console.error("Ошибка добавления сотрудника: ", error);
      res.status(500).json({ message: "Ошибка добавления сотрудника" });
    }
  }

  ////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  async updateEmployee(req, res) {
    try {
      const employeeID = parseInt(req.params.id, 10);

      const { name, surname, positions, email, services, schedules } = req.body;

      if (
        !name &&
        !surname &&
        !positions &&
        !email &&
        !services &&
        !schedules
      ) {
        return res.status(400).json({ message: "НЕт данных для удаления" });
      }

      const updateData = {};
      if (name) updateData.name = name;
      if (surname) updateData.surname = surname;
      if (positions) updateData.positions = positions;
      if (email) updateData.email = email;

      const updatedEmployee = await clientPr.employees.update({
        where: { employeeID },
        data: updateData,
      });

      if (services) {
        await clientPr.employeesServices.deleteMany({
          where: { employeeID },
        });

        // Добавление новых связей с услугами
        const servicesToAdd = services
          .filter((serviceID) => !isNaN(parseInt(serviceID, 10)))
          .map((serviceID) => ({
            employeeID,
            serviceID: parseInt(serviceID, 10),
          }));
        console.log(servicesToAdd);

        if (servicesToAdd.length > 0) {
          await clientPr.employeesServices.createMany({
            data: servicesToAdd,
          });
        }
      }

      let error = false;
      if (schedules) {
        for (const schedule of schedules) {
          try {
            const { date } = schedule;

            // Проверка существующего расписания
            const existingSchedule = await clientPr.schedule.findMany({
              where: {
                employeeID,
                date: new Date(date),
              },
            });

            if (existingSchedule && !error) {
              error = true;
              console.log("Расписание уже существует");
              throw new Error("Расписание уже существует");
              return res
                .status(409)
                .json({ message: "Расписание уже существует" });
            }

            // Проверка допустимости даты и времени
            const { startTime, endTime } = schedule;
            if (new Date(date) < new Date() && !error) {
              error = true;
              console.log("Недопустимая дата");
              throw new Error("Недействительная дата");

              return res.status(409).json({ message: "Недействительная дата" });
            }

            if (new Date(startTime) > new Date(endTime) && !error) {
              error = true;
              console.log("Недопустимое время начала и окончания ");
              throw new Error("Недопустимое время начала и окончания");
              return res
                .status(409)
                .json({ message: "Недопустимое время начала и окончания" });
            }

            // Добавление расписания для нового сотрудника
            const timeSlots = [];

            const dateUTC = new Date(date);
            const startTimeUTC = new Date(startTime);
            const endTimeUTC = new Date(endTime);

            const dateLocal = new Date(
              dateUTC.setHours(
                dateUTC.getHours() - dateUTC.getTimezoneOffset() / 60
              )
            );

            const startLocal = new Date(
              new Date(
                startTimeUTC.setHours(
                  startTimeUTC.getHours() -
                    startTimeUTC.getTimezoneOffset() / 60
                )
              ).setDate(dateLocal.getDate())
            );

            const endLocal = new Date(
              endTimeUTC.setHours(
                endTimeUTC.getHours() - endTimeUTC.getTimezoneOffset() / 60
              )
            );

            console.log("------------------------------");

            console.log("Date: ", dateLocal);
            console.log("Start time: ", startLocal);
            console.log("End time: ", endLocal);
            console.log("------------------------------");

            while (startLocal.getHours() < endLocal.getHours()) {
              timeSlots.push({
                employeeID: updatedEmployee.employeeID,
                date: dateLocal,
                startTime: new Date(startLocal),
                endTime: new Date(
                  startLocal.setHours(startLocal.getHours() + 1)
                ),
              });
            }

            new Date(startLocal.setDate(dateLocal.getDate()));
            console.log(timeSlots);
            // Добавление расписания в базу данных
            if (timeSlots.length > 0) {
              await clientPr.schedule.createMany({
                data: timeSlots,
              });
            }
          } catch (error) {
            console.error("Ошибка обработки расписания:", error);
            return res.status(409).json({ message: error.message });
          }
        }

        console.log(error);
        if (!error) {
          res.status(200).json({
            message: "Сотрудник обновлен успешно",
            employee: updatedEmployee,
          });
        }
      }
    } catch (error) {
      console.error("Ошибка обновления сотрудника:", error);
      res.status(500).json({ message: error.message });
    }
  }

  async delEmployee(req, res) {
    const employeeId = parseInt(req.params.id, 10);

    if (isNaN(employeeId)) {
      return res.status(400).json({ error: "Неверный идентификатор отзыва" });
    }

    try {
      await clientPr.schedule.deleteMany({
        where: {
          employeeID: employeeId,
        },
      });

      const deletedEmployee = await clientPr.employees.delete({
        where: {
          employeeID: employeeId,
        },
      });

      res
        .status(200)
        .json({ message: "Сотрудник удален успешно", deletedEmployee });
    } catch (error) {
      if (error.code === "P2025") {
        res.status(404).json({ error: "Сотрудник не найден" });
      } else {
        console.error("Ошибка при удалении сотрудника:", error);
        res.status(500).json({ error: "Ошибка при удалении сотрудника" });
      }
    }
  }

  async getEmployeeById(req, res) {
    try {
      const employeeID = parseInt(req.params.id, 10);

      const employee = await clientPr.employees.findFirst({
        where: { employeeID },
        include: {
          services: {
            include: {
              service: {
                select: {
                  serviceID: true,
                  name: true,
                  description: true,
                  price: true,
                },
              },
            },
          },
          schedules: {
            select: {
              scheduleID: true,
              date: true,
              startTime: true,
              endTime: true,
            },
          },
        },
      });

      if (!employee) {
        return res.status(404).json({ message: "Сотрудник не найден" });
      }

      res.status(200).json(employee);
    } catch (error) {
      console.error("Ошибка получения сотрудника по ID:", error);
      res.status(500).json({ message: "Ошибка получения сотрудника по ID" });
    }
  }

  async;
}

module.exports = new employeeController();
