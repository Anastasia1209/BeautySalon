import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ServiceForm from "../components/ServiceForm"; // Импорт компонента ServiceForm
import axios from "axios";
import { Button, Typography } from "@material-ui/core";
import NavMenu from "../components/NavMenu";
import { jwtDecode } from "jwt-decode";
import UserRoleCheck from "../components/AppRouter";

function EditService() {
  const { id } = useParams(); // Получаем id из URL
  const navigate = useNavigate();
  const [service, setService] = useState(null);
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

  // Загрузка данных услуги по идентификатору
  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await axios.get(`/serv/getservbyid/${id}`);
        setService(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Ошибка при загрузке данных услуги:", error);
        setErrorMessage("Ошибка при загрузке данных услуги.");

        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  //изменение услуги
  const handleSubmit = async (serviceData, mode) => {
    try {
      // Отправляем PUT-запрос на сервер для изменения услуги
      const response = await axios.put(`/serv/updserv/${id}`, serviceData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      console.log("Услуга успешно изменена:", response.data);
      navigate("/services");
    } catch (error) {
      console.error("Ошибка при изменении услуги:", error);
      setErrorMessage(
        error.response?.data?.error || "Ошибка при изменении услуги."
      );
    }
  };

  //удаление услуги
  const handleDelete = async () => {
    try {
      // Отправляем DELETE-запрос на сервер для удаления услуги
      await axios.delete(`/serv/delserv/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      console.log(`Услуга с id ${id} успешно удалена.`);
      // Перенаправляем пользователя после успешного удаления услуги
      navigate("/services"); // Укажите нужный маршрут для перенаправления
    } catch (error) {
      console.error("Ошибка при удалении услуги:", error);
      setErrorMessage(
        error.response?.data?.error || "Ошибка при удалении услуги."
      );
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (!service) {
    return <div>Услуга не найдена</div>;
  }

  return (
    <div>
      <UserRoleCheck userRole={userRole} />

      <NavMenu />
      <Typography variant="h4" gutterBottom>
        Редактирование услуги
      </Typography>
      <ServiceForm
        initialName={service.name}
        initialDescription={service.description}
        initialPrice={service.price}
        mode="edit"
        onSubmit={handleSubmit}
      />
      <Button
        variant="contained"
        color="secondary"
        style={{ marginTop: "20px" }}
        onClick={handleDelete}
      >
        Удалить услугу
      </Button>
      {errorMessage && (
        <Typography color="error" gutterBottom>
          {errorMessage}
        </Typography>
      )}
    </div>
  );
}

export default EditService;
