const express = require("express");
const { PrismaClient } = require("@prisma/client");
const clientPr = new PrismaClient();
const dayjs = require("dayjs");

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

        // Конвертация `day`, `startTime` и `endTime` в объекты `dayjs`
        const startDateTime = dayjs(`${date}T${startTime}`);
        const endDateTime = dayjs(`${date}T${endTime}`);

        // Разделение времени на часовые интервалы
        let currentTime = startDateTime;
        while (currentTime.isBefore(endDateTime)) {
          // Добавление интервала времени в список
          timeSlots.push({
            employeeID: newEmployee.employeeID,
            date: currentTime.format("YYYY-MM-DD"),
            startTime: currentTime.toISOString(),
            endTime: currentTime.add(1, "hour").toISOString(),
          });

          // Переход к следующему часовому интервалу
          currentTime = currentTime.add(1, "hour");
        }
        console.log(currentTime);
        // Если есть оставшееся время и оно больше или равно одному часу
        if (currentTime.isBefore(endDateTime)) {
          const remainingTime = endDateTime.diff(currentTime, "minute");

          if (remainingTime >= 60) {
            // Добавление последнего интервала времени в список
            timeSlots.push({
              employeeID: newEmployee.employeeID,
              date: currentTime.format("YYYY-MM-DD"),
              startTime: currentTime.toISOString(),
              endTime: endDateTime.toISOString(),
            });
          }
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
      // Получение идентификатора сотрудника из параметров запроса
      const employeeID = parseInt(req.params.id, 10);

      // Извлечение данных для обновления из тела запроса
      const { name, surname, positions, email, services, schedules } = req.body;

      // Обновление данных сотрудника
      const updatedEmployee = await clientPr.employees.update({
        where: { employeeID },
        data: {
          name: name || undefined,
          surname: surname || undefined,
          positions: positions || undefined,
          email: email || undefined,
        },
      });

      // Обновление услуг сотрудника
      if (services) {
        await clientPr.employees.update({
          where: { employeeID },
          data: {
            services: {
              set: services.map((serviceID) => ({ serviceID })),
            },
          },
        });
      }

      // Обновление расписания сотрудника
      if (schedules) {
        // Удаление существующего расписания
        await clientPr.schedule.deleteMany({
          where: { employeeID },
        });

        // Добавление нового расписания
        const timeSlots = [];

        for (const schedule of schedules) {
          const { day, startTime, endTime } = schedule;

          // Конвертация `day`, `startTime`, и `endTime` в объекты `dayjs`
          const startDateTime = dayjs(`${day} ${startTime}`);
          const endDateTime = dayjs(`${day} ${endTime}`);

          // Разделение времени на часовые интервалы
          let currentTime = startDateTime;
          while (currentTime.isBefore(endDateTime)) {
            // Добавление интервала времени в список
            timeSlots.push({
              employeeID,
              dateTime: currentTime.toISOString(),
            });
            // Переход к следующему часовому интервалу
            currentTime = currentTime.add(1, "hour");
          }

          // Проверка последнего интервала
          if (currentTime.isBefore(endDateTime)) {
            // Рассчитайте оставшийся интервал времени
            const remainingTime = endDateTime.diff(currentTime, "minute");

            // Если оставшийся интервал равен или больше одного часа, добавьте его
            if (remainingTime >= 60) {
              timeSlots.push({
                employeeID,
                dateTime: currentTime.toISOString(),
              });
            }
          }
        }

        // Добавление расписания в базу данных
        if (timeSlots.length > 0) {
          await clientPr.schedule.createMany({
            data: timeSlots,
          });
        }
      }

      // Возврат данных об обновленном сотруднике
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
