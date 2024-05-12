import React from "react";
import axios from "axios";
import EmployeeForm from "../components/EmployeeForm";
import { Typography } from "@material-ui/core";
import NavMenu from "../components/NavMenu";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function AddEmployee() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  // Функция для обработки отправки формы
  const handleAddEmployee = async (employeeData) => {
    try {
      const response = await axios.post("/empl/addempl", employeeData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      console.log("Сотрудник успешно добавлен:", response.data);
      navigate("/employees");
    } catch (error) {
      setError(
        error.response?.data?.message || "Ошибка при добавлении сотрудника"
      );

      console.error("Ошибка при добавлении сотрудника:", error);
    }
  };

  return (
    <div>
      <NavMenu />
      <Typography variant="h4" gutterBottom>
        Добавление сотрудника
      </Typography>
      <EmployeeForm initialData={{}} onSubmit={handleAddEmployee} mode="add" />
      {/* Вывод сообщения об ошибке */}
      {error && <Typography color="error">{error}</Typography>}
    </div>
  );
}

export default AddEmployee;
