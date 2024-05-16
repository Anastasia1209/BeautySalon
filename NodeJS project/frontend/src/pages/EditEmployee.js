import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import EmployeeForm from "../components/EmployeeForm";
import { Typography, Button } from "@material-ui/core";
import NavMenu from "../components/NavMenu";
import { jwtDecode } from "jwt-decode";
import UserRoleCheck from "../components/AppRouter";

function EditEmployeePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(""); // Состояние для ошибок
  const [userRole, setUserRole] = useState();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserRole(decodedToken.role);
    }
  }, []);

  useEffect(() => {
    // Загрузка данных о сотруднике для редактирования
    const fetchEmployeeData = async () => {
      try {
        const response = await axios.get(
          `https://localhost:5000/empl/getemplbyid/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
        console.log(response.data);
        setInitialData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Ошибка при загрузке данных о сотруднике:", error);
        setErrorMessage("Ошибка при загрузке данных о сотруднике.");

        navigate("/error"); // Укажите нужный маршрут в случае ошибки
      }
    };

    fetchEmployeeData();
  }, [id, navigate]);

  // Обработка отправки формы
  const handleUpdateEmployee = async (employeeData) => {
    try {
      //console.log("qqqqqq " + id);
      //console.log(employeeData);
      const response = await axios.put(
        `https://localhost:5000/empl/updempl/${id}`,
        employeeData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      console.log("Сотрудник успешно обновлен:", response.data);
      navigate("/employees"); // Укажите нужный маршрут после успешного обновления
    } catch (error) {
      console.error("Ошибка при обновлении сотрудника:", error);
      setErrorMessage(
        error.response?.data?.error || "Ошибка при обновлении сотрудника."
      );
    }
  };

  // Обработка удаления сотрудника
  const handleDeleteEmployee = async () => {
    try {
      // Отправка запроса на удаление сотрудника
      await axios.delete(`https://localhost:5000/empl/delempl/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      console.log("Сотрудник успешно удален");
      // Успешное удаление, перенаправляем на страницу сотрудников
      navigate("/employees");
    } catch (error) {
      console.error("Ошибка при удалении сотрудника:", error);
      setErrorMessage(
        error.response?.data?.error || "Ошибка при удалении сотрудника."
      );
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      <UserRoleCheck userRole={userRole} />

      <NavMenu />
      <Typography variant="h4" gutterBottom>
        Редактирование сотрудника
      </Typography>
      <EmployeeForm
        initialData={initialData}
        onSubmit={handleUpdateEmployee}
        mode="edit"
      />
      {/* Кнопка удаления */}
      <Button
        variant="contained"
        color="secondary"
        onClick={handleDeleteEmployee}
        style={{ marginTop: "1rem" }}
      >
        Удалить сотрудника
      </Button>
      {errorMessage && (
        <Typography color="error" gutterBottom>
          {errorMessage}
        </Typography>
      )}
    </div>
  );
}

export default EditEmployeePage;
