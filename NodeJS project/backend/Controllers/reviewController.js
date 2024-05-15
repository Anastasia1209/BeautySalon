const express = require("express");
const { PrismaClient } = require("@prisma/client");
const clientPr = new PrismaClient();

class reviewController {
  //добавление отзыва
  async addReview(req, res) {
    try {
      const { userID, employeeID, rating, comm } = req.body;

      if (!rating) {
        console.log("Оценка должна быть указана");
        return res.status(400).json({ message: "Оценка должна быть указана" });
      }
      const employee = await clientPr.employees.findFirst({
        where: {
          employeeID: employeeID,
        },
      });

      if (!employee) {
        return res.status(404).json({ message: "Сотрудник не найден" });
      }

      const newReview = await clientPr.reviews.create({
        data: {
          userID,
          employeeID,
          rating,
          comm,
        },
      });

      res.status(201).json({
        message: "Отзыв успешно добавлен",
        review: newReview,
      });
    } catch (error) {
      console.error("Ошибка добавления отзыва:", error);
      res.status(500).json({ message: "Ошибка добавления отзыва" });
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
        return res.status(404).json({ message: "Сотрудник не найден" });
      }

      const reviews = await clientPr.reviews.findMany({
        where: {
          employeeID: employeeID,
        },
        include: {
          user: true,
        },
      });

      res.status(200).json(reviews);
    } catch (error) {
      console.error("Ошибка получения отзывов о сотруднике: ", error);
      res
        .status(500)
        .json({ message: "Ошибка получения отзывов о сотруднике" });
    }
  }

  async getAverageRatingByEmployee(req, res) {
    try {
      const employeeID = parseInt(req.params.id, 10);

      if (isNaN(employeeID)) {
        return res.status(400).json({ message: "Недопустимый ID сотрудника" });
      }

      const averageRating = await clientPr.reviews.aggregate({
        where: {
          employeeID: employeeID,
        },
        _avg: {
          rating: true,
        },
      });
      const roundedAverageRating = averageRating._avg.rating
        ? averageRating._avg.rating.toFixed(2)
        : 0.0;

      res.status(200).json({ averageRating: roundedAverageRating });
    } catch (error) {
      console.error("Ошибка получения рейтинга сотрудника: ", error);
      res.status(500).json({ message: "Ошибка получения рейтинга сотрудника" });
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
