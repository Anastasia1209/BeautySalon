import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Grid, Paper, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  title: {
    marginBottom: theme.spacing(4),
  },
}));

function ServicesList() {
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

  const services = [
    {
      id: 1,
      name: "Маникюр",
      description: "Красивые и ухоженные ногти рукти все что хочешь.",
      price: 80,
    },
  ];

  return (
    <Container>
      <Grid container spacing={3}>
        {services.map((service) => (
          <Grid item xs={12} key={service.id}>
            <Paper className={classes.paper}>
              <Grid container justify="space-between" alignItems="center">
                <Grid item xs={4}>
                  <Typography variant="h6" style={{ textAlign: "left" }}>
                    {service.name}
                  </Typography>
                  <Typography variant="body2">{service.description}</Typography>
                </Grid>
                <Grid item xs={6} style={{ textAlign: "right" }}>
                  <Typography variant="body1">
                    Цена: {service.price} руб.
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default ServicesList;
