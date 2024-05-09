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
  const [schedules, setSchedules] = useState(initialData.schedules || []);
  const [availableServices, setAvailableServices] = useState([]);

  const [error, setError] = useState("");

  // Загружаем список доступных услуг из сервера
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get("/serv/getservices");
        setAvailableServices(response.data);
      } catch (error) {
        console.error("Ошибка при загрузке списка услуг:", error);
        setError("Ошибка при загрузке списка услуг.");
      }
    };
    fetchServices();
  }, []);

  // Обновляем состояния при изменении initialData
  useEffect(() => {
    setName(initialData.name || "");
    setSurname(initialData.surname || "");
    setPositions(initialData.positions || "");
    setEmail(initialData.email || "");
    setServices(initialData.services || []);
    setSchedules(initialData.schedules || []);
  }, [initialData]);

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

    try {
      // Передаем данные формы в обработчик onSubmit
      console.log(employeeData.schedules);
      await onSubmit(employeeData, mode);

      // Сброс формы после успешного добавления, если это режим добавления
      if (mode === "add") {
        setName("");
        setSurname("");
        setPositions("");
        setEmail("");
        setServices([]);
        setSchedules([]);
      }
      setError("");
    } catch (error) {
      console.error("Ошибка при обработке формы:", error);
      setError(error.response?.data?.message || "Ошибка при обработке формы");
    }
  };

  // Обработчик изменения выбранных услуг
  const handleServiceChange = (e) => {
    setServices(e.target.value);
  };

  // Обработчик изменения расписания
  const handleScheduleChange = (index, field, value) => {
    const updatedSchedules = [...schedules];
    updatedSchedules[index][field] = value;
    setSchedules(updatedSchedules);
  };

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
              .map((id) => {
                console.log(id);
                const service = availableServices.find(
                  (s) => s.id === id.serviceID
                );
                //console.log(service);
                //console.log(availableServices.find((el) => el.id === id));
                return service ? service.name : "";
              })
              .join(", ")
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
        onClick={() =>
          setSchedules([...schedules, { date: "", startTime: "", endTime: "" }])
        }
        className={classes.button}
        style={{ marginRight: "1rem" }}
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

// import React, { useState, useEffect } from "react";
// import {
//   TextField,
//   Button,
//   Typography,
//   MenuItem,
//   Select,
//   FormControl,
//   InputLabel,
// } from "@material-ui/core";
// import { makeStyles } from "@material-ui/core/styles";
// import DateTimePicker from "./DateTimePicker"; // Импортируем DateTimePicker

// import axios from "axios";

// const useStyles = makeStyles((theme) => ({
//   formControl: {
//     marginBottom: theme.spacing(2),
//   },
//   button: {
//     marginTop: theme.spacing(3),
//   },
// }));

// function EmployeeForm({ initialData = {}, mode = "add", onSubmit }) {
//   const classes = useStyles();

//   // Состояния для данных формы
//   const [name, setName] = useState(initialData.name || "");
//   const [surname, setSurname] = useState(initialData.surname || "");
//   const [positions, setPositions] = useState(initialData.positions || "");
//   const [email, setEmail] = useState(initialData.email || "");
//   const [services, setServices] = useState(initialData.services || []);
//   const [schedules, setSchedules] = useState(initialData.schedules || []);
//   const [availableServices, setAvailableServices] = useState([]);

//   const [error, setError] = useState("");

//   const serviceNameMap = availableServices.reduce((acc, service) => {
//     acc[service.id] = service.name;
//     return acc;
//   }, {});

//   // Загружаем список доступных услуг
//   useEffect(() => {
//     async function fetchServices() {
//       try {
//         const response = await axios.get("/serv/getservices");
//         setAvailableServices(response.data);
//       } catch (error) {
//         console.error("Ошибка при загрузке списка услуг:", error);
//       }
//     }
//     fetchServices();
//   }, []);

//   // Обновляем состояния при изменении initialData
//   useEffect(() => {
//     setName(initialData.name || "");
//     setSurname(initialData.surname || "");
//     setPositions(initialData.positions || "");
//     setEmail(initialData.email || "");
//     setServices(initialData.services || []);
//     setSchedules(initialData.schedules || []);
//   }, [initialData]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Валидация данных формы
//     if (!name || !surname || !email) {
//       setError("Заполните все обязательные поля.");
//       return;
//     }

//     // Формирование данных для отправки
//     const employeeData = {
//       name,
//       surname,
//       positions,
//       email,
//       services,
//       schedules,
//     };

//     try {
//       // Передаем данные формы в обработчик
//       await onSubmit(employeeData, mode);

//       // Сброс формы после успешного добавления, если это режим добавления
//       if (mode === "add") {
//         setName("");
//         setSurname("");
//         setPositions("");
//         setEmail("");
//         setServices([]);
//         setSchedules([]);
//       }
//       setError("");
//     } catch (error) {
//       console.error("Ошибка при обработке формы:", error);
//       setError(error.response?.data?.error || "Ошибка при обработке формы");
//     }
//   };

//   const handleServiceChange = (e) => {
//     setServices(e.target.value);
//   };

//   const handleScheduleChange = (index, field, value) => {
//     const updatedSchedules = [...schedules];
//     updatedSchedules[index][field] = value;
//     setSchedules(updatedSchedules);
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <TextField
//         fullWidth
//         label="Имя"
//         value={name}
//         onChange={(e) => setName(e.target.value)}
//         className={classes.formControl}
//         required
//       />
//       <TextField
//         fullWidth
//         label="Фамилия"
//         value={surname}
//         onChange={(e) => setSurname(e.target.value)}
//         className={classes.formControl}
//         required
//       />
//       <TextField
//         fullWidth
//         label="Должность"
//         value={positions}
//         onChange={(e) => setPositions(e.target.value)}
//         className={classes.formControl}
//       />
//       <TextField
//         fullWidth
//         label="Email"
//         type="email"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//         className={classes.formControl}
//         required
//       />

//       {/* Выбор услуги из списка */}
//       <FormControl fullWidth className={classes.formControl}>
//         <InputLabel id="service-label">Услуги</InputLabel>
//         <Select
//           labelId="service-label"
//           multiple
//           value={services}
//           onChange={handleServiceChange}
//           renderValue={(selected) =>
//             selected.map((id) => serviceNameMap[id]).join(", ")
//           }
//         >
//           {availableServices.map((service) => (
//             <MenuItem key={service.id} value={service.id}>
//               {service.name}
//             </MenuItem>
//           ))}
//         </Select>
//       </FormControl>

//       {/* Поля для выбора расписаний */}
//       {schedules.map((schedule, index) => (
//         <div key={index}>
//           {/* Используем DateTimePicker для выбора даты и времени */}
//           <DateTimePicker
//             index={index}
//             onUpdateSchedule={handleScheduleChange}
//           />
//         </div>
//       ))}

//       {/* Кнопка добавления нового расписания */}
//       <Button
//         variant="contained"
//         color="primary"
//         onClick={() =>
//           setSchedules([
//             ...schedules,
//             { date: null, startTime: null, endTime: null },
//           ])
//         }
//         className={classes.button}
//       >
//         Добавить расписание
//       </Button>

//       {/* Вывод сообщения об ошибке */}
//       {error && <Typography color="error">{error}</Typography>}

//       <Button
//         variant="contained"
//         color="primary"
//         type="submit"
//         className={classes.button}
//       >
//         {mode === "add" ? "Добавить сотрудника" : "Изменить сотрудника"}
//       </Button>
//     </form>
//   );
// }

// export default EmployeeForm;

////////////////////////////////////////////////////////
// import React, { useState, useEffect } from "react";
// import {
//   TextField,
//   Button,
//   Typography,
//   MenuItem,
//   Select,
//   InputLabel,
//   FormControl,
// } from "@material-ui/core";
// import axios from "axios";

// function EmployeeForm({ initialData = {}, onSubmit, mode }) {
//   // Состояние формы для отслеживания изменений
//   const [formData, setFormData] = useState({
//     name: initialData.name || "",
//     surname: initialData.surname || "",
//     positions: initialData.positions || "",
//     email: initialData.email || "",
//     phone: initialData.phone || "",
//     services: initialData.services || [],
//     schedules: initialData.schedules || [],
//   });

//   const [availableServices, setAvailableServices] = useState([]);

//   // Загрузка списка доступных услуг из API
//   useEffect(() => {
//     const fetchServices = async () => {
//       try {
//         const response = await axios.get("/serv/getservices");
//         setAvailableServices(response.data);
//       } catch (error) {
//         console.error("Ошибка при загрузке услуг:", error);
//       }
//     };

//     fetchServices();
//   }, []);

//   // Обработка изменения данных формы
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prevFormData) => ({
//       ...prevFormData,
//       [name]: value,
//     }));
//   };

//   // Обработка отправки формы
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onSubmit(formData);
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <TextField
//         label="Имя"
//         name="name"
//         value={formData.name}
//         onChange={handleChange}
//         fullWidth
//         margin="normal"
//       />
//       <TextField
//         label="Фамилия"
//         name="surname"
//         value={formData.surname}
//         onChange={handleChange}
//         fullWidth
//         margin="normal"
//       />
//       <TextField
//         label="Должность"
//         name="positions"
//         value={formData.positions}
//         onChange={handleChange}
//         fullWidth
//         margin="normal"
//       />
//       <TextField
//         label="Email"
//         name="email"
//         value={formData.email}
//         onChange={handleChange}
//         fullWidth
//         margin="normal"
//       />
//       <TextField
//         label="Телефон"
//         name="phone"
//         value={formData.phone}
//         onChange={handleChange}
//         fullWidth
//         margin="normal"
//       />

//       <FormControl fullWidth margin="normal">
//         <InputLabel id="services-label">Услуги</InputLabel>
//         <Select
//           labelId="services-label"
//           name="services"
//           multiple
//           value={formData.services}
//           onChange={handleChange}
//           renderValue={(selected) => selected.join(", ")}
//         >
//           {availableServices.map((service) => (
//             <MenuItem key={service.serviceID} value={service.serviceID}>
//               {service.name}
//             </MenuItem>
//           ))}
//         </Select>
//       </FormControl>

//       {/* Поля для расписания сотрудника */}
//       {/* Вы можете добавить логику для добавления, редактирования и удаления расписания */}
//       <Typography variant="body1" gutterBottom>
//         Расписание
//       </Typography>
//       {/* Добавьте компоненты для управления расписанием */}

//       <Button
//         type="submit"
//         fullWidth
//         variant="contained"
//         color="primary"
//         sx={{ mt: 2 }}
//       >
//         {mode === "add" ? "Добавить сотрудника" : "Изменить сотрудника"}
//       </Button>
//     </form>
//   );
// }

// export default EmployeeForm;
