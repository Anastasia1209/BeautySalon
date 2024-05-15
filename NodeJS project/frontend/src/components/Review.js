import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, TextField, Rating, Typography, Box } from "@mui/material";
import { jwtDecode } from "jwt-decode";
const AddReview = ({ employeeID, onReviewAdded }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const [userID, setUserID] = useState(null);

  const getUserIDFromToken = () => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        return decodedToken.userID;
      } catch (error) {
        console.error("Error decoding token:", error);
        return null;
      }
    } else {
      console.error("Auth token not found");
      return null;
    }
  };

  useEffect(() => {
    const userID = getUserIDFromToken();
    setUserID(userID);
  }, []);

  //то что было раньше
  // Функция для получения userID из сервера
  // const fetchUserID = async () => {
  //   const token = localStorage.getItem("authToken"); // Извлекаем токен из localStorage
  //   if (token) {
  //     try {
  //       const response = await axios.get("/auth/getuser", {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });

  //       // Если запрос успешный и получены данные пользователя, установим userID
  //       if (response.status === 200 && response.data && response.data.userID) {
  //         setUserID(response.data.userID);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching user ID:", error);
  //     }
  //   } else {
  //     console.error("Auth token not found");
  //   }
  // };

  // useEffect(() => {
  //   fetchUserID();
  // }, []);
  ///////////////////////////////////////////
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userID === null) {
      console.log("Error: User ID not found");
      return;
    }

    const reviewData = {
      userID,
      employeeID,
      rating,
      comm: comment,
    };

    console.log("reviewData:", reviewData);

    try {
      const response = await axios.post(
        "https://localhost:5000/rev/addreview",
        reviewData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.status === 201) {
        onReviewAdded && onReviewAdded(response.data);
        setRating(0);
        setComment("");
        window.location.reload();

        console.log("Review added successfully");
      } else {
        console.log("Error adding review");
      }
    } catch (error) {
      console.error("Error adding review:", error);
      setError(error.response.data.message || "Ошибка добавления отзыва");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Typography variant="h6" component="h2">
        Оставить отзыв
      </Typography>
      <Box marginBottom={2}>
        <Typography variant="body1" component="p">
          Оценка:
        </Typography>
        <Rating
          name="rating"
          value={rating}
          onChange={(event, newValue) => {
            setRating(newValue);
          }}
          precision={1}
        />
      </Box>
      <Box marginBottom={2}>
        <TextField
          label="Комментарий"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          fullWidth
          multiline
          rows={4}
        />
      </Box>
      {error && <Typography color="error">{error}</Typography>}

      <Button type="submit" variant="contained" color="primary">
        Отправить
      </Button>
    </form>
  );
};

export default AddReview;
