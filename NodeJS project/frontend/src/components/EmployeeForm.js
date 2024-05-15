import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import DateTimePicker from "./DateTimePicker";
import axios from "axios";

const useStyles = makeStyles((theme) => ({
  formControl: {
    marginBottom: theme.spacing(2),
  },
  button: {
    marginTop: theme.spacing(3),
  },
}));

function EmployeeForm({ initialData = {}, mode = "add", onSubmit }) {
  const classes = useStyles();

  // Состояния для данных формы
  const [name, setName] = useState(initialData.name || "");
  const [surname, setSurname] = useState(initialData.surname || "");
  const [positions, setPositions] = useState(initialData.positions || "");
  const [email, setEmail] = useState(initialData.email || "");
  const [services, setServices] = useState(initialData.services || []);
  const [schedules, setSchedules] = useState(
    initialData.mode === "add" ? [{ date: "", startTime: "", endTime: "" }] : []
  );
  const [availableServices, setAvailableServices] = useState([]);
  const [error, setError] = useState("");

  // Загружаем список доступных услуг из сервера
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(
          "https://localhost:5000/serv/getservices"
        );
        setAvailableServices(response.data);
      } catch (error) {
        console.error("Ошибка при загрузке списка услуг:", error);
        setError("Ошибка при загрузке списка услуг.");
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    if (mode === "edit") {
      setServices(initialData.services.map((service) => service.id));
    }
  }, [mode, initialData.services]);

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Валидация данных формы
    if (!name || !surname || !email) {
      setError("Заполните все обязательные поля.");
      return;
    }

    // Формирование данных для отправки
    const employeeData = {
      name,
      surname,
      positions,
      email,
      services,
      schedules,
    };

    console.log(employeeData);

    try {
      // Передаем данные формы в обработчик onSubmit
      await onSubmit(employeeData, mode);
      setError("");
    } catch (error) {
      console.error("Ошибка при обработке формы:", error);
      setError(error.response?.data?.message || "Ошибка при обработке формы");
    }
  };

  // Обработчик изменения выбранных услуг
  const handleServiceChange = (e) => {
    const selectedServices = e.target.value;
    setServices(selectedServices);
  };

  // Добавление нового расписания
  const handleAddSchedule = () => {
    setSchedules([...schedules, { date: "", startTime: "", endTime: "" }]);
  };

  // Обработчик изменения расписания
  const handleScheduleChange = (index, field, value) => {
    const updatedSchedules = [...schedules];
    updatedSchedules[index][field] = value;
    setSchedules(updatedSchedules);
  };

  // console.log(availableServices);

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        fullWidth
        label="Имя"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={classes.formControl}
        required
      />
      <TextField
        fullWidth
        label="Фамилия"
        value={surname}
        onChange={(e) => setSurname(e.target.value)}
        className={classes.formControl}
        required
      />
      <TextField
        fullWidth
        label="Должность"
        value={positions}
        onChange={(e) => setPositions(e.target.value)}
        className={classes.formControl}
      />
      <TextField
        fullWidth
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={classes.formControl}
        required
      />

      {/* Выбор услуги из списка */}
      <FormControl fullWidth className={classes.formControl}>
        <InputLabel id="service-label">Услуги</InputLabel>
        <Select
          labelId="service-label"
          multiple
          value={services}
          onChange={handleServiceChange}
          renderValue={(selected) =>
            selected
              .map((serv) => {
                const service = availableServices.find((s) => {
                  return s.id == serv;
                });
                return service ? service.name : "";
              })
              .join("   ")
          }
        >
          {availableServices.map((service) => (
            <MenuItem key={service.id} value={service.id}>
              {service.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Поля для выбора расписаний */}
      {schedules.map((schedule, index) => (
        <div key={index}>
          <DateTimePicker
            index={index}
            schedule={schedule}
            onUpdateSchedule={handleScheduleChange}
          />
        </div>
      ))}

      {/* Кнопка добавления нового расписания */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleAddSchedule}
        className={classes.button}
      >
        Добавить расписание
      </Button>

      {/* Вывод сообщения об ошибке */}
      {error && <Typography color="error">{error}</Typography>}

      {/* Кнопка отправки формы */}
      <Button
        variant="contained"
        color="primary"
        type="submit"
        className={classes.button}
      >
        {mode === "add" ? "Добавить сотрудника" : "Изменить сотрудника"}
      </Button>
    </form>
  );
}

export default EmployeeForm;
