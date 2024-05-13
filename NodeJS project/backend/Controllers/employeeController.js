const express = require("express");
const { PrismaClient } = require("@prisma/client");
const clientPr = new PrismaClient();
const dayjs = require("dayjs");
require("dayjs/plugin/utc");
require("dayjs/plugin/timezone");
dayjs.extend(require("dayjs/plugin/utc"));
dayjs.extend(require("dayjs/plugin/timezone"));

// Функция для преобразования времени в формат ISO-8601
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
        // Включаем связанные данные об услугах для каждого сотрудника
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
      console.error("Error getting employees:", error);
      res.status(500).json({ message: "Error getting employees" });
    }
  }

  async getEmployeesByService(req, res) {
    try {
      // const serviceID = parseInt(req.params.id, 10);

      // const { serviceID } = req.body;
      const { serviceID } = req.params;
      const parsedServiceID = parseInt(serviceID, 10);

      console.log(parsedServiceID);

      if (!serviceID) {
        return res.status(400).json({ message: "Service ID is required" });
      }

      // Поиск сотрудников, предоставляющих данную услугу
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

      // Проверка наличия сотрудников для данной услуги
      if (employees.length === 0) {
        return res
          .status(404)
          .json({ message: "No employees found for the specified service" });
      }

      // Возвращаем список сотрудников (имя и фамилию) в ответ
      res.status(200).json({
        message: "Employees retrieved successfully",
        employees: employees,
      });
    } catch (error) {
      console.error("Error retrieving employees by service:", error);
      res
        .status(500)
        .json({ message: "Error retrieving employees by service" });
    }
  }

  //////////////////////////////////
  //////////////////////////////////
  // async addSchedule(newEmployee, schedules, clientPr) {
  //   const timeSlots = [];

  //   const { date, startTime, endTime } = schedules[0];

  //////////////////////////////////
  //добавление сотрудника
  async addEmployee(req, res) {
    try {
      // Извлечение данных из тела запроса
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

      // Проверка существования сотрудника с таким же email
      const existingEmployee = await clientPr.employees.findFirst({
        where: {
          email: email,
        },
      });

      if (existingEmployee) {
        console.log("Employee with this email already exists");
        return res
          .status(409)
          .json({ message: "Employee with this email already exists" });
      }

      // Создание нового сотрудника и добавление его услуг
      const newEmployee = await clientPr.employees.create({
        data: {
          name,
          surname,
          positions,
          email,
          // Добавление связей с услугами
          services: {
            create: services.map((serviceID) => ({ serviceID })),
          },
        },
      });

      schedules.forEach(async (schedule) => {
        const { date, startTime, endTime } = schedule;

        if (new Date(date) < new Date()) {
          console.log("Invalid date");
          return res.status(409).json({ message: "Invalid date" });
        }

        if (new Date(startTime) > new Date(endTime)) {
          console.log("Invalid start and end time");
          return res
            .status(409)
            .json({ message: "Invalid start and end time" });
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
        // Добавление расписания в базу данных
        if (timeSlots.length > 0) {
          await clientPr.schedule.createMany({
            data: timeSlots,
          });

          //clientPr.schedule.upsert()
        }
      });

      // Возврат данных о созданном сотруднике
      res.status(201).json({
        message: "Employee added successfully",
        employee: newEmployee,
      });
    } catch (error) {
      console.error("Error adding employee:", error);
      res.status(500).json({ message: "Error adding employee" });
    }
  }

  ////////////////////////////////////////
  /////////////////////////////////////////
  /////////////////////////////////////////
  async updateEmployee(req, res) {
    try {
      // Извлечение идентификатора сотрудника из параметров запроса
      const employeeID = parseInt(req.params.id, 10);

      // Извлечение данных из тела запроса
      const { name, surname, positions, email, services, schedules } = req.body;

      // Проверка, указаны ли данные для обновления
      if (
        !name &&
        !surname &&
        !positions &&
        !email &&
        !services &&
        !schedules
      ) {
        return res.status(400).json({ message: "No data provided for update" });
      }

      // Обновление информации о сотруднике
      const updateData = {};
      if (name) updateData.name = name;
      if (surname) updateData.surname = surname;
      if (positions) updateData.positions = positions;
      if (email) updateData.email = email;

      // Обновление сотрудника в базе данных
      const updatedEmployee = await clientPr.employees.update({
        where: { employeeID },
        data: updateData,
      });

      // Обновление услуг сотрудника
      if (services) {
        // Извлечение существующих связей с услугами сотрудника
        const existingServices = await clientPr.employeesServices.findMany({
          where: { employeeID },
          select: {
            serviceID: true,
          },
        });

        // Создание множества существующих и переданных услуг
        const existingServiceIDs = new Set(
          existingServices.map((service) => service.serviceID)
        );
        const newServiceIDs = new Set(services);

        // Удаление услуг, которых больше нет в переданных данных
        const servicesToRemove = Array.from(existingServiceIDs).filter(
          (serviceID) => !newServiceIDs.has(serviceID)
        );
        if (servicesToRemove.length > 0) {
          await clientPr.employeesServices.deleteMany({
            where: {
              employeeID,
              serviceID: { in: servicesToRemove },
            },
          });
        }

        // Добавление новых услуг, которых нет в существующих
        const servicesToAdd = Array.from(newServiceIDs).filter(
          (serviceID) => !existingServiceIDs.has(serviceID)
        );
        if (servicesToAdd.length > 0) {
          await clientPr.employeesServices.createMany({
            data: servicesToAdd.map((serviceID) => ({
              employeeID,
              serviceID,
            })),
          });
        }
      }

      // Обновление расписания сотрудника
      if (schedules) {
        // Удаление существующего расписания
        await clientPr.schedule.deleteMany({
          where: { employeeID },
        });

        // Добавление расписания для нового сотрудника
        const timeSlots = [];

        for (const schedule of schedules) {
          const { date, startTime, endTime } = schedule;

          // Преобразование `date`, `startTime`, и `endTime` в формат ISO-8601
          const dateISO = convertToISO(date, "00:00");
          const startTimeISO = convertToISO(date, startTime);
          const endTimeISO = convertToISO(date, endTime);

          // Разделение времени на часовые интервалы
          let currentTime = dayjs(startTimeISO);
          const endTimeDate = dayjs(endTimeISO);
          console.log(currentTime);
          while (currentTime.isBefore(endTimeDate)) {
            // Добавление интервала времени в список
            timeSlots.push({
              employeeID,
              date: dateISO,
              startTime: currentTime.toISOString(),
              endTime: currentTime.add(1, "hour").toISOString(),
            });

            // Переход к следующему часовому интервалу
            currentTime = currentTime.add(1, "hour");
          }
          console.log(currentTime);

          // Проверка оставшегося времени и добавление последнего интервала, если необходимо
          const remainingTime = endTimeDate.diff(currentTime, "minute");
          if (remainingTime >= 60) {
            timeSlots.push({
              employeeID,
              date: dateISO,
              startTime: currentTime.toISOString(),
              endTime: endTimeDate.toISOString(),
            });
          }
        }

        // Добавление расписания в базу данных
        if (timeSlots.length > 0) {
          await clientPr.schedule.createMany({
            data: timeSlots,
          });
        }
      }

      // Возврат данных об успешно обновленном сотруднике
      res.status(200).json({
        message: "Employee updated successfully",
        employee: updatedEmployee,
      });
    } catch (error) {
      console.error("Error updating employee:", error);
      res.status(500).json({ message: "Error updating employee" });
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
        .json({ message: "Review deleted successfully", deletedEmployee });
    } catch (error) {
      if (error.code === "P2025") {
        res.status(404).json({ error: "Review not found" });
      } else {
        console.error("Ошибка при удалении отзыва:", error);
        res.status(500).json({ error: "Ошибка при удалении отзыва" });
      }
    }
  }

  async getEmployeeById(req, res) {
    try {
      // Получение идентификатора сотрудника из параметров запроса
      const employeeID = parseInt(req.params.id, 10);

      // Поиск сотрудника по идентификатору и включение его услуг и расписания
      const employee = await clientPr.employees.findFirst({
        where: { employeeID },
        include: {
          // Включение данных о связанных услугах через модель `Servics`
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
          // Включение данных о связанном расписании
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

      // Если сотрудник не найден, возвращается сообщение об ошибке
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      // Возврат данных о сотруднике, его услугах и расписании
      res.status(200).json(employee);
    } catch (error) {
      console.error("Error getting employee by ID:", error);
      res.status(500).json({ message: "Error getting employee by ID" });
    }
  }

  async;
}

module.exports = new employeeController();
