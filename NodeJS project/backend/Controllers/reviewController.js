const express = require("express");
const { PrismaClient } = require("@prisma/client");
const clientPr = new PrismaClient();

class reviewController {
  //добавление отзыва
  async addReview(req, res) {
    try {
      // Извлечение данных отзыва из тела запроса
      const { userID, employeeID, rating, comm } = req.body;

      // Проверка существования сотрудника
      const employee = await clientPr.employees.findFirst({
        where: {
          employeeID: employeeID,
        },
      });

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      // Создание отзыва
      const newReview = await clientPr.reviews.create({
        data: {
          userID,
          employeeID,
          rating,
          comm,
        },
      });

      // Возврат данных о созданном отзыве
      res.status(201).json({
        message: "Review added successfully",
        review: newReview,
      });
    } catch (error) {
      console.error("Error adding review:", error);
      res.status(500).json({ message: "Error adding review" });
    }
  }
  //получение отзывов по сотруднику
  async getReviewsByEmployee(req, res) {
    try {
      const employeeID = parseInt(req.params.id, 10);

      const employee = await clientPr.employees.findFirst({
        where: {
          employeeID: employeeID,
        },
      });

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const reviews = await clientPr.reviews.findMany({
        where: {
          employeeID: employeeID,
        },
      });

      res.status(200).json(reviews);
    } catch (error) {
      console.error("Error getting reviews for employee:", error);
      res.status(500).json({ message: "Error getting reviews for employee" });
    }
  }

  //удаление отзыва
  async delReview(req, res) {
    const reviewId = parseInt(req.params.id, 10);

    if (isNaN(reviewId)) {
      return res.status(400).json({ error: "Неверный идентификатор отзыва" });
    }

    try {
      const deletedReview = await clientPr.reviews.delete({
        where: {
          reviewID: reviewId,
        },
      });

      res
        .status(200)
        .json({ message: "Review deleted successfully", deletedReview });
    } catch (error) {
      if (error.code === "P2025") {
        res.status(404).json({ error: "Review not found" });
      } else {
        console.error("Ошибка при удалении отзыва:", error);
        res.status(500).json({ error: "Ошибка при удалении отзыва" });
      }
    }
  }

  async;
}

module.exports = new reviewController();
