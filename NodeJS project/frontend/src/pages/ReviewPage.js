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
  const isAuthenticated = !!localStorage.getItem("authToken");

  const loadReviews = async () => {
    try {
      const response = await axios.get(
        `https://localhost:5000/rev/getrewempl/${employeeID}`
      );

      setReviews(response.data);
    } catch (error) {
      console.error("Ошибка при загрузке отзывов:", error);

      if (error.response && error.response.status === 403) {
        //  navigate("/login");
      } else {
        console.error("Подробное сообщение об ошибке:", error.response?.data);
      }
    }
  };

  useEffect(() => {
    loadReviews();
  }, [employeeID]);

  return (
    <div>
      <NavMenu />
      {isAuthenticated && <AddReview employeeID={employeeID} />}
      <Typography variant="h4" className={classes.title}>
        Отзывы
      </Typography>{" "}
      <ReviewList reviews={reviews} />
    </div>
  );
}

export default ReviewPage;
