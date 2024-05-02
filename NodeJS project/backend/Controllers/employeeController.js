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
      const employees = await clientPr.employees.findMany();
      res.status(200).json(employees);
    } catch (error) {
      console.error("Error getting employees:", error);
      res.status(500).json({ message: "Error getting employees" });
    }
  }
  //добавление сотрудника
  async addEmployee(req, res) {
    try {
      // Извлечение данных из тела запроса
      const { name, surname, positions, email, services, schedules } = req.body;

      // Проверка существования сотрудника с таким же email
      const existingEmployee = await clientPr.employees.findFirst({
        where: {
          email: email,
        },
      });

      if (existingEmployee) {
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

      // Добавление расписания для нового сотрудника
      const timeSlots = [];

      for (const schedule of schedules) {
        const { date, startTime, endTime } = schedule;

        console.log("Date:", date);
        console.log("Start time:", startTime);
        console.log("End time:", endTime);

        // Преобразование `date`, `startTime`, и `endTime` в формат ISO-8601
        // const dateISO = convertToISO(date, "00:00");
        // const startTimeISO = convertToISO(date, startTime);
        // const endTimeISO = convertToISO(date, endTime);
        const dateISO = dayjs(date).startOf("day").toISOString();
        // Устанавливаем дату `date` для `startTime` и `endTime`, прибавляя 3 часа
        const adjustedStartTime = dayjs(startTime).add(3, "hour");
        const adjustedEndTime = dayjs(endTime).add(3, "hour");

        // Объединяем `date` с `adjustedStartTime` и `adjustedEndTime`
        const startTimeISO = dayjs(date)
          .hour(adjustedStartTime.hour())
          .minute(adjustedStartTime.minute())
          .second(0)
          .toISOString();
        const endTimeISO = dayjs(date)
          .hour(adjustedEndTime.hour())
          .minute(adjustedEndTime.minute())
          .second(0)
          .toISOString();

        console.log(dateISO);
        console.log(startTimeISO);
        console.log(endTimeISO);

        // Разделение времени на часовые интервалы
        let currentTime = dayjs(startTimeISO);
        const endTimeDate = dayjs(endTimeISO);

        console.log(currentTime);

        while (currentTime.isBefore(endTimeDate)) {
          // Добавление интервала времени в список
          timeSlots.push({
            employeeID: newEmployee.employeeID,
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
            employeeID: newEmployee.employeeID,
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
