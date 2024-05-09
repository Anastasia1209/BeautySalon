import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Typography } from "@material-ui/core";
import EmployeeList from "../components/EmployeeList";
import { makeStyles } from "@material-ui/core/styles";
import { jwtDecode } from "jwt-decode";
import NavMenu from "../components/NavMenu";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

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

function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const classes = useStyles();
  const navigate = useNavigate();

  const handleAddEmployee = () => {
    navigate("/empl/addempl");
  };

  const token = localStorage.getItem("authToken");
  let userRole = "USER"; // Устанавливаем значение по умолчанию

  if (token) {
    const decodedToken = jwtDecode(token);
    if (decodedToken && decodedToken.role) {
      userRole = decodedToken.role;
    }
  }

  // Загрузка данных сотрудников из API при монтировании компонента
  useEffect(() => {
    axios
      .get("/empl/getempl") // API для получения списка сотрудников
      .then((response) => {
        setEmployees(response.data); // Устанавливаем список сотрудников в состояние
      })
      .catch((error) => {
        console.error("Ошибка загрузки данных о сотрудниках:", error);
      });
  }, []);

  return (
    <Container>
      <NavMenu />
      <Typography variant="h4" className={classes.title}>
        Список сотрудников
      </Typography>
      <Button variant="contained" color="primary" onClick={handleAddEmployee}>
        Добавить сотрудника
      </Button>
      {/* Передаем список сотрудников в компонент EmployeeList */}
      <EmployeeList employees={employees} userRole={userRole} />
    </Container>
  );
}

export default EmployeesPage;
