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
} from "@mui/material";

import DateTimePicker from "../components/DateTimePicker";

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
      .get("/serv/getservices")
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
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Проверки перед отправкой данных
    if (!name || !surname || !positions || !email) {
      console.error("Пожалуйста, заполните все поля.");
      return;
    }
    if (!selectedServices.length) {
      console.error("Пожалуйста, выберите хотя бы одну услугу.");
      return;
    }

    const employeeData = {
      name,
      surname,
      positions,
      email,
      services: selectedServices,
      schedules,
    };

    try {
      const response = await axios.post("/empl/addempl", employeeData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      console.log("Employee added successfully:", response.data);
      // Сброс формы после успешного добавления
      setName("");
      setSurname("");
      setPositions("");
      setEmail("");
      setSelectedServices([]);
      setSchedules([]);
    } catch (error) {
      // console.error("Error adding employee:", error);
      if (error.response && error.response.status === 409) {
        console.error(
          "Error adding employee: Сотрудник с таким email уже существует."
        );
      } else {
        console.error("Error adding employee:", error);
      }
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Добавить сотрудника
      </Typography>
      <form onSubmit={handleSubmit}>
        {/* Поля для имени, фамилии, должности и email */}
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
            {/* Используем DateTimePicker для выбора дня и времени */}
            <DateTimePicker index={index} onUpdateSchedule={updateSchedule} />
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

///////предыдущая версия//////////
//import React, { useState, useEffect } from "react";
// import axios from "axios";
// import {
//   Container,
//   Typography,
//   TextField,
//   Button,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Grid,
// } from "@mui/material";
// import { TimePicker, LocalizationProvider } from "@mui/lab";
// //import AdapterDayjs from "@mui/lab/AdapterDayjs";
// import { LocalizationProvider } from "@mui/x-date-pickers-pro";
// import { AdapterDayjs } from "@mui/x-date-pickers-pro/AdapterDayjs";
// import { DateRangeCalendar } from "@mui/x-date-pickers-pro";

// function AddEmployeeForm() {
//   const [name, setName] = useState("");
//   const [surname, setSurname] = useState("");
//   const [positions, setPositions] = useState("");
//   const [email, setEmail] = useState("");
//   const [services, setServices] = useState([]);
//   const [selectedServices, setSelectedServices] = useState([]);
//   //const [schedules, setSchedules] = useState([]);
//   const [dateRange, setDateRange] = useState([null, null]);

//   // Получение списка услуг
//   useEffect(() => {
//     axios
//       .get("/serv/getservices")
//       .then((response) => {
//         setServices(response.data);
//       })
//       .catch((error) => {
//         console.error("Error getting services:", error);
//       });
//   }, []);

//   // Добавление расписания
//   const addSchedule = () => {
//     setSchedules([...schedules, { day: "", startTime: null, endTime: null }]);
//   };

//   // Обновление расписания
//   const updateSchedule = (index, field, value) => {
//     const updatedSchedules = [...schedules];
//     updatedSchedules[index][field] = value;
//     setSchedules(updatedSchedules);
//   };

//   // Обработка отправки формы
//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     // Проверки перед отправкой данных
//     if (!name || !surname || !positions || !email) {
//       console.error("Пожалуйста, заполните все поля.");
//       return;
//     }
//     if (!selectedServices.length) {
//       console.error("Пожалуйста, выберите хотя бы одну услугу.");
//       return;
//     }

//     const employeeData = {
//       name,
//       surname,
//       positions,
//       email,
//       services: selectedServices,
//       schedules,
//     };

//     try {
//       const response = await axios.post("/empl/addempl", employeeData, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("authToken")}`,
//         },
//       });
//       console.log("Employee added successfully:", response.data);
//       // Сброс формы после успешного добавления
//       setName("");
//       setSurname("");
//       setPositions("");
//       setEmail("");
//       setSelectedServices([]);
//       setSchedules([]);
//     } catch (error) {
//       console.error("Error adding employee:", error);
//     }
//   };

//   return (
//     <Container>
//       <Typography variant="h4" gutterBottom>
//         Добавить сотрудника
//       </Typography>
//       <form onSubmit={handleSubmit}>
//         <TextField
//           fullWidth
//           label="Имя"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           margin="normal"
//         />
//         <TextField
//           fullWidth
//           label="Фамилия"
//           value={surname}
//           onChange={(e) => setSurname(e.target.value)}
//           margin="normal"
//         />
//         <TextField
//           fullWidth
//           label="Должность"
//           value={positions}
//           onChange={(e) => setPositions(e.target.value)}
//           margin="normal"
//         />
//         <TextField
//           fullWidth
//           label="Email"
//           type="email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           margin="normal"
//         />

//         {/* Список услуг */}
//         <FormControl fullWidth margin="normal">
//           <InputLabel>Выберите услуги</InputLabel>
//           <Select
//             multiple
//             value={selectedServices}
//             onChange={(e) => setSelectedServices(e.target.value)}
//           >
//             {services.map((service) => (
//               <MenuItem key={service.serviceID} value={service.serviceID}>
//                 {service.name}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>

//         {/* Расписание */}
//         <Typography variant="h6" gutterBottom>
//           Расписание работы
//         </Typography>
//         {schedules.map((schedule, index) => (
//           <Grid container spacing={2} key={index} style={{ marginBottom: 8 }}>
//             <Grid item xs={4}>
//               <TextField
//                 fullWidth
//                 label="День недели"
//                 value={schedule.day}
//                 onChange={(e) => updateSchedule(index, "day", e.target.value)}
//               />
//             </Grid>
//             <Grid item xs={4}>
//               <LocalizationProvider dateAdapter={AdapterDayjs}>
//                 <TimePicker
//                   label="Начало работы"
//                   value={schedule.startTime}
//                   onChange={(time) => updateSchedule(index, "startTime", time)}
//                   renderInput={(params) => <TextField {...params} />}
//                 />
//               </LocalizationProvider>
//             </Grid>
//             <Grid item xs={4}>
//               <LocalizationProvider dateAdapter={AdapterDayjs}>
//                 <TimePicker
//                   label="Окончание работы"
//                   value={schedule.endTime}
//                   onChange={(time) => updateSchedule(index, "endTime", time)}
//                   renderInput={(params) => <TextField {...params} />}
//                 />
//               </LocalizationProvider>
//             </Grid>
//           </Grid>
//         ))}
//         <Button
//           variant="contained"
//           color="secondary"
//           onClick={addSchedule}
//           style={{ marginBottom: 16 }}
//         >
//           Добавить расписание
//         </Button>

//         <Button type="submit" variant="contained" color="primary">
//           Добавить сотрудника
//         </Button>
//       </form>
//     </Container>
//   );
// }

// export default AddEmployeeForm;
