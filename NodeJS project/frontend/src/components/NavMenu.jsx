import React from "react";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
  Grid,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  title: {
    flexGrow: 1,
    textAlign: "left",
    color: "#ffffff",
    textDecoration: "none",
  },
  button: {
    color: "#ffffff",
  },
  sectionContainer: {
    marginTop: theme.spacing(8), // Установить отступ от верхнего меню
    backgroundColor: "#ffffff", // Белый фон
    padding: theme.spacing(2),
    display: "flex",
    justifyContent: "center",
    marginLeft: theme.spacing(15),
  },
  link: {
    color: "#000000",
    textDecoration: "none",
    marginRight: theme.spacing(28),
  },
}));

// const sections = [
//   { title: "Цены и услуги", url: "/services" },
//   { title: "Отзывы", url: "#" },
// ];

export default function NavMenu({ sections = [] }) {
  const classes = useStyles();
  // const { nav } = props;
  return (
    <div className={classes.root}>
      <AppBar position="fixed">
        <Container fixed>
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
              <Link to="/main" className={classes.title}>
                Салон красоты
              </Link>
            </Typography>

            <Box>
              <Link to="/login">
                <Button color="inherit" className={classes.button}>
                  Войти
                </Button>
              </Link>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Разделы под навигационным меню */}
      <Box className={classes.sectionContainer}>
        <Container>
          <Grid container spacing={2}>
            {sections.map((section) => (
              <Grid item key={section.title}>
                <Link to={section.url} className={classes.link}>
                  {section.title}
                </Link>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </div>
  );
}
