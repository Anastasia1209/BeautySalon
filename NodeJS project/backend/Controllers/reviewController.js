const express = require("express");
const { PrismaClient } = require("@prisma/client");
const clientPr = new PrismaClient();

class reviewController {
  //добавление отзыва
  async addReview(req, res) {
    try {
      // Извлечение данных отзыва из тела запроса
      const { userID, employeeID, rating, comm } = req.body;

      if (!rating) {
        console.log("Оценка должна быть указана");
        return res.status(400).json({ message: "Оценка должна быть указана" });
      }
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
        include: {
          user: true, // Включаем отношение с моделью `Users` для получения пользователя
        },
      });

      res.status(200).json(reviews);
    } catch (error) {
      console.error("Error getting reviews for employee:", error);
      res.status(500).json({ message: "Error getting reviews for employee" });
    }
  }

  async getAverageRatingByEmployee(req, res) {
    try {
      // Получение `employeeID` из параметра маршрута
      const employeeID = parseInt(req.params.id, 10);

      // Проверка на действительность `employeeID`
      if (isNaN(employeeID)) {
        return res.status(400).json({ message: "Invalid employee ID" });
      }

      // Вычисление среднего рейтинга для отзывов сотрудника
      const averageRating = await clientPr.reviews.aggregate({
        where: {
          employeeID: employeeID, // Условие фильтрации по `employeeID`
        },
        _avg: {
          rating: true, // Вычисляем среднее значение поля `rating`
        },
      });
      const roundedAverageRating = averageRating._avg.rating
        ? averageRating._avg.rating.toFixed(2)
        : 0.0;

      // Возврат среднего рейтинга клиенту
      res.status(200).json({ averageRating: roundedAverageRating });
    } catch (error) {
      console.error("Error getting average rating for employee:", error);
      res
        .status(500)
        .json({ message: "Error getting average rating for employee" });
    }
  }

  //оно оказывается не нужно))))
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
