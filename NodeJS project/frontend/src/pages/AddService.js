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

  const handleSubmit = () => {
    // Обработка отправки данных на сервер
    const serviceData = {
      name,
      description,
      price,
    };

    axios
      .post("/api/services", serviceData)
      .then((response) => {
        console.log("Услуга успешно добавлена:", response.data);
        // Вы можете добавить логику после успешного добавления услуги, например, сброс формы или отображение сообщения об успехе
        setName("");
        setDescription("");
        setPrice("");
      })
      .catch((error) => {
        console.error("Ошибка при добавлении услуги:", error);
        // Вы можете добавить логику обработки ошибок, например, отображение сообщения об ошибке
      });
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
