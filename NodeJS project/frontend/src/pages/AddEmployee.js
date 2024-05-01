import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
} from "@mui/material";
import { DatePicker, TimePicker, LocalizationProvider } from "@mui/lab";
import AdapterDayjs from "@mui/lab/AdapterDayjs";

function AddEmployeeForm() {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [positions, setPositions] = useState("");
  const [email, setEmail] = useState("");
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [schedules, setSchedules] = useState([]);

  // Получение списка услуг
  useEffect(() => {
    axios
      .get("/services")
      .then((response) => {
        setServices(response.data);
      })
      .catch((error) => {
        console.error("Error getting services:", error);
      });
  }, []);

  // Добавление расписания
  const addSchedule = () => {
    setSchedules([...schedules, { day: "", startTime: null, endTime: null }]);
  };

  // Обновление расписания
  const updateSchedule = (index, field, value) => {
    const updatedSchedules = [...schedules];
    updatedSchedules[index][field] = value;
    setSchedules(updatedSchedules);
  };

  // Обработка отправки формы
  const handleSubmit = async (event) => {
    event.preventDefault();

    const employeeData = {
      name,
      surname,
      positions,
      email,
      services: selectedServices,
      schedules,
    };

    try {
      const response = await axios.post("/employees", employeeData);
      console.log("Employee added successfully:", response.data);
      // Сброс формы после успешного добавления
      setName("");
      setSurname("");
      setPositions("");
      setEmail("");
      setSelectedServices([]);
      setSchedules([]);
    } catch (error) {
      console.error("Error adding employee:", error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Добавить сотрудника
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Фамилия"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Должность"
          value={positions}
          onChange={(e) => setPositions(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
        />

        {/* Список услуг */}
        <FormControl fullWidth margin="normal">
          <InputLabel>Выберите услуги</InputLabel>
          <Select
            multiple
            value={selectedServices}
            onChange={(e) => setSelectedServices(e.target.value)}
          >
            {services.map((service) => (
              <MenuItem key={service.serviceID} value={service.serviceID}>
                {service.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Расписание */}
        <Typography variant="h6" gutterBottom>
          Расписание работы
        </Typography>
        {schedules.map((schedule, index) => (
          <Grid container spacing={2} key={index} style={{ marginBottom: 8 }}>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="День недели"
                value={schedule.day}
                onChange={(e) => updateSchedule(index, "day", e.target.value)}
              />
            </Grid>
            <Grid item xs={4}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  label="Начало работы"
                  value={schedule.startTime}
                  onChange={(time) => updateSchedule(index, "startTime", time)}
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={4}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  label="Окончание работы"
                  value={schedule.endTime}
                  onChange={(time) => updateSchedule(index, "endTime", time)}
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        ))}
        <Button
          variant="contained"
          color="secondary"
          onClick={addSchedule}
          style={{ marginBottom: 16 }}
        >
          Добавить расписание
        </Button>

        <Button type="submit" variant="contained" color="primary">
          Добавить сотрудника
        </Button>
      </form>
    </Container>
  );
}

export default AddEmployeeForm;

//////////////////////////////////
// import React, { useState } from "react";
// import { Button, Container, TextField, Typography } from "@material-ui/core";
// import { makeStyles } from "@material-ui/core/styles";
// import axios from "axios";
// import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// const useStyles = makeStyles((theme) => ({
//   formControl: {
//     marginBottom: theme.spacing(2),
//   },
//   button: {
//     marginTop: theme.spacing(3),
//   },
// }));

// function AddMasterForm() {
//   const classes = useStyles();

//   // Состояния для данных формы
//   const [name, setName] = useState("");
//   const [surname, setSurname] = useState("");
//   const [position, setPosition] = useState("");
//   const [phone, setPhone] = useState("");
//   const [email, setEmail] = useState("");
//   const [dateTime, setDateTime] = useState(null); // Добавлено состояние для даты и времени

//   const handleSubmit = () => {
//     // Обработка отправки данных на сервер
//     const masterData = {
//       name,
//       surname,
//       position,
//       phone,
//       email,
//       dateTime, // Добавьте дату и время в данные, отправляемые на сервер
//     };

//     axios
//       .post("/api/masters", masterData)
//       .then((response) => {
//         console.log("Мастер успешно добавлен:", response.data);
//         // Сброс формы после успешного добавления
//         setName("");
//         setSurname("");
//         setPosition("");
//         setPhone("");
//         setEmail("");
//         setDateTime(null);
//       })
//       .catch((error) => {
//         console.error("Ошибка при добавлении мастера:", error);
//       });
//   };

//   return (
//     <Container>
//       <Typography variant="h4" gutterBottom>
//         Добавить мастера
//       </Typography>
//       <form>
//         <TextField
//           fullWidth
//           label="Имя"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           className={classes.formControl}
//         />
//         <TextField
//           fullWidth
//           label="Фамилия"
//           value={surname}
//           onChange={(e) => setSurname(e.target.value)}
//           className={classes.formControl}
//         />
//         <TextField
//           fullWidth
//           label="Должность"
//           value={position}
//           onChange={(e) => setPosition(e.target.value)}
//           className={classes.formControl}
//         />
//         <TextField
//           fullWidth
//           label="Телефон"
//           value={phone}
//           onChange={(e) => setPhone(e.target.value)}
//           className={classes.formControl}
//         />
//         <TextField
//           fullWidth
//           label="Email"
//           type="email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           className={classes.formControl}
//         />

//         {/* Добавляем DateTimePicker в форму */}
//         <LocalizationProvider dateAdapter={AdapterDayjs}>
//           <DateTimePicker
//             label="Дата и время"
//             value={dateTime}
//             onChange={(newValue) => setDateTime(newValue)}
//             renderInput={(params) => <TextField {...params} />}
//             className={classes.formControl}
//           />
//         </LocalizationProvider>

//         <Button
//           variant="contained"
//           color="primary"
//           onClick={handleSubmit}
//           className={classes.button}
//         >
//           Добавить мастера
//         </Button>
//       </form>
//     </Container>
//   );
// }

// export default AddMasterForm;
