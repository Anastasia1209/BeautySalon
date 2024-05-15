import React from "react";
import { Link } from "react-router-dom";
import { Container, Grid, Paper, Typography, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Rating from "@mui/material/Rating";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2),
    cursor: "pointer",
  },
  rating: {
    fontWeight: "bold",
  },
}));
////////////////////////////////////////
function ReviewsList({ reviews }) {
  const classes = useStyles();

  return (
    <Container>
      <Grid container spacing={3}>
        {reviews.map((review) => (
          <Grid item xs={12} key={review.id}>
            <Paper className={classes.paper}>
              <Grid
                container
                justifyContent="space-between"
                alignItems="center"
              >
                <Grid item xs={12}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography variant="body1" style={{ textAlign: "left" }}>
                      Оценка:
                    </Typography>
                    <Rating
                      name={`rating-${review.id}`}
                      value={review.rating}
                      readOnly
                    />
                  </Box>
                  <Typography variant="body2" style={{ textAlign: "left" }}>
                    {review.comm}
                  </Typography>
                  {/* Отображение информации о пользователе и сотруднике */}
                  {review.user && (
                    <Typography variant="body2" style={{ textAlign: "right" }}>
                      Пользователь: {review.user.name}
                    </Typography>
                  )}
                  {review.employee && (
                    <Typography variant="body2" style={{ textAlign: "left" }}>
                      Сотрудник: {review.employee.name}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default ReviewsList;
