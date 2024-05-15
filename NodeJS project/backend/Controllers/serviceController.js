const express = require("express");
const { PrismaClient } = require("@prisma/client");
const clientPr = new PrismaClient();

class serviceController {
  //добавлениe новой услуги
  async addService(req, res) {
    const { name, description, price } = req.body;

    if (!name || price === undefined) {
      console.log("Название услуги и цена обязательны");
      return res
        .status(400)
        .json({ error: "Название услуги и цена обязательны" });
    }

    try {
      const existingService = await clientPr.servics.findFirst({
        where: { name },
      });

      if (existingService) {
        console.log("Услуга с таким именем уже существует");
        return res
          .status(409)
          .json({ message: "Услуга с таким именем уже существует" });
      }

      const priceFormatted = parseFloat(price).toFixed(2);

      const newService = await clientPr.servics.create({
        data: {
          name,
          description,
          price: priceFormatted,
        },
      });

      res
        .status(201)
        .json({ message: "Услуга добавлена успешно: ", newService });
      console.log("Услуга добавлена успешно: ", newService);
    } catch (error) {
      console.error("Ошибка при добавлении услуги:", error);
      res.status(500).json({ error: "Ошибка при добавлении услуги" });
    }
  }

  //получение услуг
  async getServices(req, res) {
    try {
      const services = await clientPr.servics.findMany();

      const servicesWithId = services.map((service) => ({
        id: service.serviceID,
        name: service.name,
        description: service.description,
        price: service.price,
      }));
      res.status(200).json(servicesWithId);
    } catch (error) {
      console.error("Ошибка при получении услуг:", error);
      res.status(500).json({ error: "Ошибка при получении услуг" });
    }
  }

  //получение услуги по id
  async getServById(req, res) {
    const serviceID = parseInt(req.params.id, 10);
    console.log(serviceID);

    if (isNaN(serviceID)) {
      return res.status(400).json({ error: "Неверный идентификатор услуги" });
    }
    try {
      const service = await clientPr.servics.findFirst({
        where: {
          serviceID,
        },
      });
      const serviceData = {
        id: service.serviceID,
        name: service.name,
        description: service.description,
        price: service.price,
      };

      if (!service) {
        return res.status(404).json({ error: "Услуга не найдена" });
      }

      res.status(200).json(serviceData);
    } catch (error) {
      console.error("Ошибка при получении услуги по id:", error);
      res.status(500).json({ error: "Ошибка при получении услуги по id" });
    }
  }

  //обновление услуги
  async updServ(req, res) {
    const serviceID = parseInt(req.params.id, 10);

    if (isNaN(serviceID)) {
      return res.status(400).json({ error: "Неверный идентификатор услуги" });
    }

    const { name, description, price } = req.body;

    const updateData = {};

    if (name !== undefined) {
      updateData.name = name;
    }
    if (description !== undefined) {
      updateData.description = description;
    }
    if (price !== undefined) {
      updateData.price = parseFloat(price).toFixed(2);
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "Нет данных для обновления" });
    }
    try {
      const updatedService = await clientPr.servics.update({
        where: {
          serviceID,
        },
        data: updateData,
      });

      console.log("Услуга обновлена успешно");
      res
        .status(200)
        .json({ message: "Услуга обновлена успешно", updatedService });
    } catch (error) {
      console.error("Ошибка при обновлении услуги:", error);
      res.status(500).json({ error: "Ошибка при обновлении услуги" });
    }
  }

  //удаление услуги
  async delServ(req, res) {
    const serviceId = parseInt(req.params.id, 10);

    if (isNaN(serviceId)) {
      return res.status(400).json({ error: "Неверный идентификатор услуги" });
    }

    try {
      const deletedService = await clientPr.servics.delete({
        where: {
          serviceID: serviceId,
        },
      });

      console.log("Услуга удалена успешно");
      res
        .status(200)
        .json({ message: "Услуга удалена успешно ", deletedService });
    } catch (error) {
      if (error.code === "P2025") {
        res.status(404).json({ error: "Услуга не найдена" });
      } else {
        console.error("Ошибка при удалении услуги:", error);
        res.status(500).json({ error: "Ошибка при удалении услуги" });
      }
    }
  }
  async;
}

module.exports = new serviceController();
