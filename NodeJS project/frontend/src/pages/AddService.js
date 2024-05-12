import React, { useState } from "react";
import ServiceForm from "../components/ServiceForm"; // Импорт компонента ServiceForm
import axios from "axios";
import { Typography } from "@material-ui/core";
import NavMenu from "../components/NavMenu";
import { useNavigate } from "react-router-dom";

function AddServiceForm() {
  const [error, setError] = useState(""); // Состояние для ошибок
  const navigate = useNavigate();

  const handleSubmit = async (serviceData, mode) => {
    try {
      const response = await axios.post("/serv/addservice", serviceData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      console.log("Услуга успешно добавлена:", response.data.newService);
      navigate("/services");
      setError("");
    } catch (error) {
      console.error("Ошибка при добавлении услуги:", error);
      setError(error.response?.data?.error || "Ошибка при добавлении услуги.");
    }
  };

  return (
    <div>
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
