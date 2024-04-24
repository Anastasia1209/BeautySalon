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

function AddMasterForm() {
  const classes = useStyles();

  // Состояния для данных формы
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [position, setPosition] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    // Обработка отправки данных на сервер
    const masterData = {
      name,
      surname,
      position,
      phone,
      email,
    };

    axios
      .post("/api/masters", masterData)
      .then((response) => {
        console.log("Мастер успешно добавлен:", response.data);
        // Вы можете добавить логику после успешного добавления мастера, например, сброс формы или отображение сообщения об успехе
        setName("");
        setSurname("");
        setPosition("");
        setPhone("");
        setEmail("");
      })
      .catch((error) => {
        console.error("Ошибка при добавлении мастера:", error);
        // Вы можете добавить логику обработки ошибок, например, отображение сообщения об ошибке
      });
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Добавить мастера
      </Typography>
      <form>
        <TextField
          fullWidth
          label="Имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={classes.formControl}
        />
        <TextField
          fullWidth
          label="Фамилия"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          className={classes.formControl}
        />
        <TextField
          fullWidth
          label="Должность"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className={classes.formControl}
        />
        <TextField
          fullWidth
          label="Телефон"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={classes.formControl}
        />
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={classes.formControl}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          className={classes.button}
        >
          Добавить мастера
        </Button>
      </form>
    </Container>
  );
}

export default AddMasterForm;
