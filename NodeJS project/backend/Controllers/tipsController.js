const express = require("express");
const { PrismaClient } = require("@prisma/client");
const clientPr = new PrismaClient();

class tipsController {
  async addTip(req, res) {
    const { tip } = req.body;

    if (!tip) {
      console.log("Текст совета обязателен");
      return res.status(400).json({ error: "Текст совета обязателен" });
    }

    try {
      const newTip = await clientPr.tips.create({
        data: {
          tip,
        },
      });

      res.status(201).json({ message: "Совет успешно добавлен", newTip });
      console.log("Совет успешно добавлен: ", newTip);
    } catch (error) {
      console.error("Ошибка при добавлении совета:", error);
      res.status(500).json({ error: "Ошибка при добавлении совета" });
    }
  }

  async getRandomTip(req, res) {
    try {
      const allTips = await clientPr.tips.findMany();

      const randomIndex = Math.floor(Math.random() * allTips.length);
      const randomTip = allTips[randomIndex];

      if (randomTip) {
        res.status(200).json({ tip: randomTip });
      } else {
        res.status(404).json({ error: "Запись не найдена" });
      }
    } catch (error) {
      console.error("Ошибка при получении случайной записи:", error);
      res.status(500).json({ error: "Ошибка при получении случайной записи" });
    }
  }

  async;
}

module.exports = new tipsController();
