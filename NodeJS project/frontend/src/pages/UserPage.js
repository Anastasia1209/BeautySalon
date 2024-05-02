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

function UserPage() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Получение данных о текущем пользователе из API
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("authToken");

        // Добавляем токен в заголовок Authorization запроса
        const response = await axios.get("/auth/getuser", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data);
        // Инициализация formData значениями текущего пользователя
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

    fetchCurrentUser();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("authToken");

      // Отправка данных для обновления пользователя
      const response = await axios.put(
        `/auth/upduser/${user.userID}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("User updated successfully:", response.data);
      // После успешного обновления можно перезагрузить данные о пользователе
      setUser(response.data.user);
    } catch (error) {
      console.error("Error updating user:", error);
    }
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
      </form>
    </Container>
  );
}

export default UserPage;
