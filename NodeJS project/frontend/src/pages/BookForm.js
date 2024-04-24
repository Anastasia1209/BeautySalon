// import React, { useEffect, useState } from "react";
// import {
//   Button,
//   Container,
//   FormControl,
//   Grid,
//   MenuItem,
//   Select,
//   TextField,
//   Typography,
// } from "@material-ui/core";
// import { makeStyles } from "@material-ui/core/styles";
// import { DatePicker } from "@mui/lab";
// import axios from "axios";

// const useStyles = makeStyles((theme) => ({
//   formControl: {
//     marginBottom: theme.spacing(2),
//   },
//   button: {
//     marginTop: theme.spacing(3),
//   },
// }));

// function BookingForm() {
//   const [services, setServices] = useState([]);
//   const [masters, setMasters] = useState([]);
//   const [availableTimes, setAvailableTimes] = useState([]);
//   const [selectedService, setSelectedService] = useState("");
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [selectedTime, setSelectedTime] = useState("");
//   const [selectedMaster, setSelectedMaster] = useState("");

//   const classes = useStyles();

//   // Загрузка данных из базы данных
//   useEffect(() => {
//     // Загрузка услуг
//     axios
//       .get("/api/services")
//       .then((response) => {
//         setServices(response.data);
//       })
//       .catch((error) => {
//         console.error("Ошибка загрузки данных об услугах:", error);
//       });

//     // Загрузка мастеров
//     axios
//       .get("/api/masters")
//       .then((response) => {
//         setMasters(response.data);
//       })
//       .catch((error) => {
//         console.error("Ошибка загрузки данных о мастерах:", error);
//       });
//   }, []);

//   // Загрузка доступного времени при выборе услуги, даты и мастера
//   useEffect(() => {
//     if (selectedService && selectedDate && selectedMaster) {
//       axios
//         .get(
//           `/api/available-times?service=${selectedService}&date=${selectedDate}&master=${selectedMaster}`
//         )
//         .then((response) => {
//           setAvailableTimes(response.data);
//         })
//         .catch((error) => {
//           console.error("Ошибка загрузки доступного времени:", error);
//         });
//     }
//   }, [selectedService, selectedDate, selectedMaster]);

//   const handleSubmit = () => {
//     // Обработка отправки формы записи
//     console.log("Услуга:", selectedService);
//     console.log("Дата:", selectedDate);
//     console.log("Время:", selectedTime);
//     console.log("Мастер:", selectedMaster);
//     // Отправка данных формы на сервер
//     axios
//       .post("/api/book", {
//         service: selectedService,
//         date: selectedDate,
//         time: selectedTime,
//         master: selectedMaster,
//       })
//       .then((response) => {
//         console.log("Запись успешно создана:", response);
//       })
//       .catch((error) => {
//         console.error("Ошибка создания записи:", error);
//       });
//   };

//   return (
//     <Container>
//       <Typography variant="h4" gutterBottom>
//         Запись на услугу
//       </Typography>
//       <FormControl fullWidth className={classes.formControl}>
//         <Select
//           value={selectedService}
//           onChange={(e) => setSelectedService(e.target.value)}
//           displayEmpty
//           inputProps={{ "aria-label": "Выберите услугу" }}
//         >
//           <MenuItem value="">
//             <em>Выберите услугу</em>
//           </MenuItem>
//           {services.map((service) => (
//             <MenuItem key={service.id} value={service.id}>
//               {service.name}
//             </MenuItem>
//           ))}
//         </Select>
//       </FormControl>
//       <FormControl fullWidth className={classes.formControl}>
//         <DatePicker
//           label="Дата"
//           value={selectedDate}
//           onChange={(date) => setSelectedDate(date)}
//           renderInput={(params) => <TextField {...params} />}
//         />
//       </FormControl>
//       <FormControl fullWidth className={classes.formControl}>
//         <Select
//           value={selectedTime}
//           onChange={(e) => setSelectedTime(e.target.value)}
//           displayEmpty
//           inputProps={{ "aria-label": "Выберите время" }}
//         >
//           <MenuItem value="">
//             <em>Выберите время</em>
//           </MenuItem>
//           {availableTimes.map((time) => (
//             <MenuItem key={time} value={time}>
//               {time}
//             </MenuItem>
//           ))}
//         </Select>
//       </FormControl>
//       <FormControl fullWidth className={classes.formControl}>
//         <Select
//           value={selectedMaster}
//           onChange={(e) => setSelectedMaster(e.target.value)}
//           displayEmpty
//           inputProps={{ "aria-label": "Выберите мастера" }}
//         >
//           <MenuItem value="">
//             <em>Выберите мастера</em>
//           </MenuItem>
//           {masters.map((master) => (
//             <MenuItem key={master.id} value={master.id}>
//               {master.name}
//             </MenuItem>
//           ))}
//         </Select>
//       </FormControl>
//       <Button
//         variant="contained"
//         color="primary"
//         onClick={handleSubmit}
//         className={classes.button}
//       >
//         Записаться
//       </Button>
//     </Container>
//   );
// }

// export default BookingForm;
////////////////////////////////////////////////////
import React, { useState } from "react";
import {
  Button,
  Container,
  FormControl,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import axios from "axios";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const useStyles = makeStyles((theme) => ({
  formControl: {
    marginBottom: theme.spacing(2),
  },
  button: {
    marginTop: theme.spacing(3),
  },
}));

function BookingForm() {
  const classes = useStyles();

  // Определение массивов данных
  const services = [
    {
      id: 1,
      name: "Массаж",
      description: "Расслабляющий массаж для всего тела.",
    },
    {
      id: 2,
      name: "Маникюр",
      description: "Красивые и ухоженные ногти.",
    },
  ];

  const masters = [
    {
      id: 1,
      name: "Мастер 1",
    },
    {
      id: 2,
      name: "Мастер 2",
    },
  ];

  const availableTimes = ["10:00", "11:00", "12:00", "13:00"];

  // Определение массива доступных дат
  const availableDates = ["2024-05-05", "2024-05-07", "2024-05-10"];

  // Состояния формы
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedMaster, setSelectedMaster] = useState("");

  // Функция, которая определяет, недоступна ли дата
  const shouldDisableDate = (date) => {
    const formattedDate = date.toISOString().split("T")[0];
    return !availableDates.includes(formattedDate);
  };

  const handleSubmit = () => {
    // Обработка отправки формы записи
    console.log("Услуга:", selectedService);
    console.log("Дата:", selectedDate);
    console.log("Время:", selectedTime);
    console.log("Мастер:", selectedMaster);
    // Выполните действия при отправке формы
    axios
      .post("/api/booking", {
        service: selectedService,
        date: selectedDate,
        time: selectedTime,
        master: selectedMaster,
      })
      .then((response) => {
        console.log("Запись успешно создана:", response.data);
        // Выполните действия после успешной отправки
      })
      .catch((error) => {
        console.error("Ошибка при создании записи:", error);
        // Обработайте ошибку
      });
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Запись на услугу
      </Typography>
      <FormControl fullWidth className={classes.formControl}>
        <Select
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          displayEmpty
          inputProps={{ "aria-label": "Выберите услугу" }}
        >
          <MenuItem value="">
            <em>Выберите услугу</em>
          </MenuItem>
          {services.map((service) => (
            <MenuItem key={service.id} value={service.id}>
              {service.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <FormControl fullWidth className={classes.formControl}>
          <DatePicker
            label="Дата"
            value={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            shouldDisableDate={shouldDisableDate}
            renderInput={(params) => <TextField {...params} />}
          />
        </FormControl>
      </LocalizationProvider>
      <FormControl fullWidth className={classes.formControl}>
        <Select
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          displayEmpty
          inputProps={{ "aria-label": "Выберите время" }}
        >
          <MenuItem value="">
            <em>Выберите время</em>
          </MenuItem>
          {availableTimes.map((time) => (
            <MenuItem key={time} value={time}>
              {time}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth className={classes.formControl}>
        <Select
          value={selectedMaster}
          onChange={(e) => setSelectedMaster(e.target.value)}
          displayEmpty
          inputProps={{ "aria-label": "Выберите мастера" }}
        >
          <MenuItem value="">
            <em>Выберите мастера</em>
          </MenuItem>
          {masters.map((master) => (
            <MenuItem key={master.id} value={master.id}>
              {master.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        className={classes.button}
      >
        Записаться
      </Button>
    </Container>
  );
}

export default BookingForm;
