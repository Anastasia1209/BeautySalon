import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ServicesList from "../components/ServiceList";
import NavMenu from "../components/NavMenu";

const useStyles = makeStyles((theme) => ({
  title: {
    marginBottom: theme.spacing(4),
  },
}));

function ServicesPage() {
  const [services, setServices] = useState([]);
  const classes = useStyles();

  useEffect(() => {
    axios
      .get("/serv/getservices")
      .then((response) => {
        setServices(response.data);
      })
      .catch((error) => {
        console.error("Ошибка загрузки данных об услугах:", error);
      });
  }, []);

  return (
    <Container>
      <NavMenu />
      <Typography variant="h4" className={classes.title}>
        Цены и услуги
      </Typography>
      <ServicesList services={services} />
    </Container>
  );
}

export default ServicesPage;
