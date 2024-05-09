import React from "react";
import { Container, Grid, Paper, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom"; // Импортируем Link для кликабельности

// Определяем стили для компонента
const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  title: {
    marginBottom: theme.spacing(4),
  },
  employeeName: {
    textDecoration: "none", // Убираем подчеркивание для ссылок
    color: "inherit", // Наследуем цвет от родителя
  },
}));

// Компонент для отображения списка сотрудников
function EmployeeList({ employees, userRole }) {
  const classes = useStyles();

  return (
    <Container>
      <Grid container spacing={3}>
        {employees.map((employee) => (
          <Grid item xs={12} key={employee.id}>
            <Link
              to={
                userRole === "ADMIN"
                  ? `/empl/updempl/${employee.id}`
                  : `/rev/getrewempl/${employee.id}`
              }
              className={classes.employeeName}
            >
              <Paper className={classes.paper}>
                {/* Переход на страницу редактирования сотрудника */}

                {/* Имя и фамилия сотрудника */}
                <Typography variant="h6">
                  {employee.name} {employee.surname}
                </Typography>

                {/* Email и номер телефона сотрудника */}
                <Typography variant="body2">Email: {employee.email}</Typography>

                {/* Список услуг, предоставляемых сотрудником */}
                <Typography variant="body2">
                  Услуги: {employee.services.join(", ")}
                </Typography>
              </Paper>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
export default EmployeeList;
