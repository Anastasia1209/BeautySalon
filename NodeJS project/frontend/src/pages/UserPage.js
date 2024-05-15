import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import NavMenu from "../components/NavMenu";
import BookCard from "../components/BookCard";

function UserPage() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [error, setError] = useState("");

  // Функция для загрузки текущего пользователя
  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get("https://localhost:5000/auth/getuser", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      setUser(response.data);
      setFormData({
        name: response.data.name,
        phone: response.data.phone,
        email: response.data.email,
      });
    } catch (error) {
      console.error("Error fetching current user:", error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Получение данных о текущем пользователе из API

    fetchCurrentUser();
  }, [navigate]);

  const fetchUserRegistrations = async () => {
    try {
      const response = await axios.get("https://localhost:5000/book/getbook", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      setRegistrations(response.data.registrations || []);
    } catch (error) {
      console.error(
        "Ошибка при получении информации о записях на услуги:",
        error
      );
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserRegistrations();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !user.userID) {
      console.error("User ID is not defined.");
      return;
    }
    console.log("user.userID:", user.userID);

    try {
      //  const token = localStorage.getItem("authToken");

      const response = await axios.put(
        `https://localhost:5000/auth/upduser/${user.userID}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      console.log("User updated successfully:", response.data);
      fetchCurrentUser();
    } catch (error) {
      console.error("Error updating user:", error);
      setError(
        error.response?.data?.message || "Ошибка при обновлении пользователя"
      );
    }
  };

  const onCancel = async (registrationID) => {
    try {
      console.log(registrationID);
      await axios.delete(
        `https://localhost:5000/book/delbook/${registrationID}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      console.log("Запись успешно отменена");
      window.location.reload();

      fetchUserRegistrations();
    } catch (error) {
      console.error("Ошибка при отмене регистрации:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setUser(null);
    navigate("/main");
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Typography>Ошибка загрузки данных о пользователе.</Typography>;
  }

  return (
    <Container>
      <NavMenu />
      <Typography variant="h4" gutterBottom>
        Информация о пользователе
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Имя"
          name="name"
          value={formData.name || ""}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="outlined"
        />
        <TextField
          label="Телефон"
          name="phone"
          value={formData.phone || ""}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="outlined"
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          value={formData.email || ""}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="outlined"
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
        >
          Сохранить
        </Button>
        {error && <Typography color="error">{error}</Typography>}
        <Button
          onClick={handleLogout}
          fullWidth
          variant="outlined"
          color="secondary"
          sx={{ mt: 2 }}
        >
          Выйти
        </Button>
      </form>
      <BookCard registrations={registrations} onCancel={onCancel} />
    </Container>
  );
}

export default UserPage;
