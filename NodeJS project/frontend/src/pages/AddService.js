import React, { useState } from "react";
import { Button, Container, TextField, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import axios from "axios";

const useStyles = makeStyles((theme) => ({
  formControl: {
    marginBottom: theme.spacing(2),
  },
  button: {
    marginTop: theme.spacing(3),
  },
}));

function AddServiceForm() {
  const classes = useStyles();

  // Состояния для данных формы
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Обработка отправки данных на сервер
    // Валидируйте данные формы
    if (!name || price <= 0) {
      console.error("Bведите корректные данные.");
      return;
    }

    const serviceData = {
      name,
      description,
      price,
    };

    try {
      // Отправляем POST-запрос на сервер
      const response = axios.post("/serv/addservice", serviceData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      console.log("Услуга успешно добавлена:", response.data);

      // Сброс формы после успешного добавления
      setName("");
      setDescription("");
      setPrice("");
    } catch (error) {
      console.error("Ошибка при добавлении услуги:", error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Добавить услугу
      </Typography>
      <form>
        <TextField
          fullWidth
          label="Название услуги"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={classes.formControl}
        />
        <TextField
          fullWidth
          label="Описание услуги"
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={classes.formControl}
        />
        <TextField
          fullWidth
          label="Цена услуги"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className={classes.formControl}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          className={classes.button}
        >
          Добавить услугу
        </Button>
      </form>
    </Container>
  );
}

export default AddServiceForm;
