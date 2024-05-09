import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import axios from "axios";
import ReviewList from "../components/ReviewList"; // Подкорректируйте путь к компоненту
import { Typography } from "@material-ui/core";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import AddReview from "../components/Review";
import NavMenu from "../components/NavMenu";

const useStyles = makeStyles((theme) => ({
  title: {
    marginBottom: theme.spacing(4),
  },
}));

function ReviewPage() {
  const [reviews, setReviews] = useState([]);
  const classes = useStyles();
  const { id } = useParams();
  const employeeID = parseInt(id, 10);
  const navigate = useNavigate();

  //   const userID = 1; // Замените на реальный userID
  //   const employeeID = 2; // Замените на реальный employeeID

  //   const handleReviewAdded = (reviewData) => {
  //     // Обработка данных о добавленном отзыве
  //     console.log("Review added:", reviewData);
  //   };

  // useEffect(() => {
  //   axios
  //     .get(`/rev/getrewempl/${employeeID}`,{
  //       headers: {
  //         Authorization: `Bearer ${localStorage.getItem('authToken')}`, // Замените 'authToken' на реальный ключ токена, если он отличается
  //     }
  //     })

  //     .then((response) => {
  //       setReviews(response.data);
  //     })
  //     .catch((error) => {
  //       console.error("Ошибка загрузки данных об услугах:", error);
  //     });
  // }, [employeeID]);

  // Функция загрузки отзывов о сотруднике
  const loadReviews = async () => {
    try {
      // Получение токена из localStorage
      const authToken = localStorage.getItem("authToken");

      // Запрос на получение отзывов о сотруднике
      const response = await axios.get(`/rev/getrewempl/${employeeID}`, {
        headers: {
          Authorization: `Bearer ${authToken}`, // Добавьте токен в заголовок
        },
      });

      setReviews(response.data);
    } catch (error) {
      // Если произошла ошибка, отобразите сообщение в консоли
      console.error("Ошибка при загрузке отзывов:", error);

      // Обработка ошибок
      if (error.response && error.response.status === 403) {
        // Если статус 403 (Forbidden), перенаправьте на страницу входа
        navigate("/login");
      } else {
        // Показать более подробное сообщение об ошибке
        console.error("Подробное сообщение об ошибке:", error.response?.data);
      }
    }
  };

  // Загрузка отзывов при монтировании компонента
  useEffect(() => {
    loadReviews();
  }, [employeeID]);

  return (
    <div>
      <NavMenu />
      <AddReview employeeID={employeeID} />
      <Typography variant="h4" className={classes.title}>
        Отзывы
      </Typography>{" "}
      <ReviewList reviews={reviews} />
    </div>
  );
}

export default ReviewPage;
