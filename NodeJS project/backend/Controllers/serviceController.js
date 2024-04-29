const express = require("express");
const { PrismaClient } = require("@prisma/client");
const clientPr = new PrismaClient();

class serviceController {
  //добавлениe новой услуги
  async addService(req, res) {
    // Получаем данные из тела запроса
    const { name, description, price } = req.body;

    // Проверяем корректность данных
    if (!name || price === undefined) {
      return res
        .status(400)
        .json({ error: "Название услуги и цена обязательны" });
    }

    try {
      const existingService = await clientPr.servics.findFirst({
        where: { name },
      });

      if (existingService) {
        return res.status(409).json({ message: "Service name already exists" });
      }

      const priceFormatted = parseFloat(price).toFixed(2);

      // Создаем новую услугу в базе данных с помощью Prisma
      const newService = await clientPr.servics.create({
        data: {
          name,
          description,
          price: priceFormatted,
        },
      });

      // Возвращаем добавленную услугу как подтверждение
      res.status(201).json({ message: "Service add successfully", newService });
    } catch (error) {
      console.error("Ошибка при добавлении услуги:", error);
      res.status(500).json({ error: "Ошибка при добавлении услуги" });
    }
  }

  //получение услуг
  async getServices(req, res) {
    try {
      const services = await clientPr.servics.findMany();
      res.status(200).json({ services });
    } catch (error) {
      console.error("Ошибка при получении услуг:", error);
      res.status(500).json({ error: "Ошибка при получении услуг" });
    }
  }

  //получение услуги по id
  async getServById(req, res) {
    const serviceId = parseInt(req.params.id, 10);
    console.log(serviceId);

    if (isNaN(serviceId)) {
      return res.status(400).json({ error: "Неверный идентификатор услуги" });
    }
    try {
      const service = await clientPr.servics.findFirst({
        where: {
          serviceID: serviceId,
        },
      });

      if (!service) {
        return res.status(404).json({ error: "Услуга не найдена" });
      }

      // Возвращаем услугу в ответе
      res.status(200).json({ service });
    } catch (error) {
      console.error("Ошибка при получении услуги по id:", error);
      res.status(500).json({ error: "Ошибка при получении услуги по id" });
    }
  }

  //обновление услуги
  async updServ(req, res) {
    const serviceId = parseInt(req.params.id, 10);

    // Проверяем корректность идентификатора
    if (isNaN(serviceId)) {
      return res.status(400).json({ error: "Неверный идентификатор услуги" });
    }

    const { name, description, price } = req.body;

    // Подготавливаем объект данных для обновления
    const updateData = {};

    // Добавляем только предоставленные поля
    if (name !== undefined) {
      updateData.name = name;
    }
    if (description !== undefined) {
      updateData.description = description;
    }
    if (price !== undefined) {
      updateData.price = parseFloat(price).toFixed(2);
    }

    // Проверяем, есть ли данные для обновления
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "Нет данных для обновления" });
    }
    try {
      const updatedService = await clientPr.servics.update({
        where: {
          serviceID: serviceId,
        },
        data: updateData,
      });

      res
        .status(200)
        .json({ message: "Service updated successfully", updatedService });
    } catch (error) {
      console.error("Ошибка при обновлении услуги:", error);
      res.status(500).json({ error: "Ошибка при обновлении услуги" });
    }
  }

  //удаление услуги
  async delServ(req, res) {
    const serviceId = parseInt(req.params.id, 10);

    // Проверяем корректность идентификатора
    if (isNaN(serviceId)) {
      return res.status(400).json({ error: "Неверный идентификатор услуги" });
    }

    try {
      // Удаляем услугу по идентификатору из базы данных с помощью Prisma
      const deletedService = await clientPr.servics.delete({
        where: {
          serviceID: serviceId,
        },
      });

      // Возвращаем подтверждение об удалении услуги
      res
        .status(200)
        .json({ message: "Service deleted successfully", deletedService });
    } catch (error) {
      if (error.code === "P2025") {
        // Если услуга не найдена
        res.status(404).json({ error: "Service not found" });
      } else {
        console.error("Ошибка при удалении услуги:", error);
        res.status(500).json({ error: "Ошибка при удалении услуги" });
      }
    }
  }
  async;
}

module.exports = new serviceController();
