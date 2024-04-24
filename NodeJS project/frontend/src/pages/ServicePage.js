import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Grid, Paper, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ServicesList from "../components/ServiceList";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  title: {
    marginBottom: theme.spacing(4),
  },
}));

function ServicesPage() {
  //  const [services, setServices] = useState([]);
  const classes = useStyles();

  // Загрузка данных об услугах с сервера с использованием Axios
  //   useEffect(() => {
  //     axios
  //       .get("/api/services") // Здесь предполагается, что сервер предоставляет маршрут /api/services
  //       .then((response) => {
  //         setServices(response.data);
  //       })
  //       .catch((error) => {
  //         console.error("Ошибка загрузки данных об услугах:", error);
  //       });
  //   }, []);

  return (
    <Container>
      <Typography variant="h4" className={classes.title}>
        Цены и услуги
      </Typography>
      <ServicesList></ServicesList>
    </Container>
  );
}

export default ServicesPage;
