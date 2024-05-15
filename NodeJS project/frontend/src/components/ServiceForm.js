import React, { useState, useEffect } from "react";
import { Button, TextField, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  formControl: {
    marginBottom: theme.spacing(2),
  },
  button: {
    marginTop: theme.spacing(3),
  },
}));

function ServiceForm({
  initialName = "",
  initialDescription = "",
  initialPrice = 0,
  mode = "add",
  onSubmit,
}) {
  const classes = useStyles();

  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [price, setPrice] = useState(initialPrice);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(initialName);
    setDescription(initialDescription);
    setPrice(initialPrice);
  }, [initialName, initialDescription, initialPrice]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || price <= 0) {
      setError("Введите корректные данные.");
      return;
    }

    const serviceData = {
      name,
      description,
      price,
    };

    try {
      await onSubmit(serviceData, mode);

      if (mode === "add") {
        setName("");
        setDescription("");
        setPrice(0);
      }
      setError("");
    } catch (error) {
      console.error("Ошибка при обработке формы:", error);
      setError(error.response.data.message || "Ошибка при обработке формы");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
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
        onChange={(e) => setPrice(parseFloat(e.target.value))}
        className={classes.formControl}
      />

      {/* Вывод сообщения об ошибке */}
      {error && <Typography color="error">{error}</Typography>}

      <Button
        variant="contained"
        color="primary"
        type="submit"
        className={classes.button}
      >
        {mode === "add" ? "Добавить услугу" : "Изменить услугу"}
      </Button>
    </form>
  );
}

export default ServiceForm;
