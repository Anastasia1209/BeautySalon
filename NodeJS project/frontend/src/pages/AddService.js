import React, { useState, useEffect } from "react";
import ServiceForm from "../components/ServiceForm"; // Импорт компонента ServiceForm
import axios from "axios";
import { Typography } from "@material-ui/core";
import NavMenu from "../components/NavMenu";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import UserRoleCheck from "../components/AppRouter";

function AddServiceForm() {
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

  const handleSubmit = async (serviceData, mode) => {
    try {
      const response = await axios.post(
        "https://localhost:5000/serv/addservice",
        serviceData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      console.log("Услуга успешно добавлена:", response.data.newService);
      navigate("/services");
      setError("");
    } catch (error) {
      console.error("Ошибка при добавлении услуги:", error);
      setError(error.response.data.message || "Ошибка при добавлении услуги.");
    }
  };

  return (
    <div>
      <UserRoleCheck userRole={userRole} />
      <NavMenu />
      <ServiceForm
        initialName=""
        initialDescription=""
        initialPrice={0}
        mode="add"
        onSubmit={handleSubmit}
      />

      {error && (
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
      )}
    </div>
  );
}

export default AddServiceForm;
