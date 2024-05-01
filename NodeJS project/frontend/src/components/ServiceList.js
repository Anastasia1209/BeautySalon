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
///////////////////////////////////////////////////
function ServicesList({ services }) {
  const classes = useStyles();

  return (
    <Container>
      <Grid container spacing={3}>
        {services.map((service) => (
          <Grid item xs={12} key={service.id}>
            <Paper className={classes.paper}>
              <Grid container justify="space-between" alignItems="center">
                <Grid item xs={8}>
                  <Typography variant="h6" style={{ textAlign: "left" }}>
                    {service.name}
                  </Typography>
                  <Typography variant="body2" style={{ textAlign: "left" }}>
                    {service.description}
                  </Typography>
                </Grid>
                <Grid item xs={4} style={{ textAlign: "right" }}>
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
