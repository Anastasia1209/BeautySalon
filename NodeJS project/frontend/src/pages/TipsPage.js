import React, { useState, useEffect } from "react";
import { Container, Typography, TextField, Button } from "@mui/material";
import axios from "axios";
import NavMenu from "../components/NavMenu"; // Импорт компонента NavMenu
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import UserRoleCheck from "../components/AppRouter";

const AddTipPage = () => {
  const [tip, setTip] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserRole(decodedToken.role);
    }
  }, []);

  const handleAddTip = async () => {
    try {
      const response = await axios.post(
        "/tips/addtips",
        { tip },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      console.log("Совет успешно добавлен");
      // setMessage(response.data.message);
      setTip("");
      setError("");
    } catch (error) {
      setError(error.response.data.message || "Ошибка при добавлении совета");
    }
  };

  return (
    <div>
      <UserRoleCheck userRole={userRole} />
      <NavMenu />
      <Container>
        <Typography variant="h4" gutterBottom>
          Добавление совета
        </Typography>
        <TextField
          label="Текст совета"
          fullWidth
          value={tip}
          onChange={(e) => setTip(e.target.value)}
          margin="normal"
          variant="outlined"
        />
        <Button variant="contained" color="primary" onClick={handleAddTip}>
          Добавить совет
        </Button>

        {error && (
          <Typography variant="body1" style={{ color: "red" }}>
            {error}
          </Typography>
        )}
      </Container>
    </div>
  );
};

export default AddTipPage;
