import React, { useState, useEffect } from "react";
import {
  Button,
  Container,
  FormControl,
  MenuItem,
  Select,
  TextField,
  Typography,
  InputLabel,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import axios from "axios";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import NavMenu from "../components/NavMenu";
import EmployeeCard from "../components/EmployeeCard";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

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
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [notes, setNotes] = useState("");
  const [availableServices, setAvailableServices] = useState([]);
  const [availableEmployee, setAvailableEmployee] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [userID, setUserID] = useState(null);
  const navigate = useNavigate();

  const getUserIDFromToken = () => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        return decodedToken.userID; //`userID` из декодированного токена
      } catch (error) {
        console.error("Error decoding token:", error);
        return null;
      }
    } else {
      console.error("Auth token not found");
      return null;
    }
  };
  useEffect(() => {
    const userID = getUserIDFromToken();
    setUserID(userID);
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get("/serv/getservices", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        setAvailableServices(response.data || []);
      } catch (error) {
        console.error("Ошибка при загрузке списка услуг:", error);
      }
    };
    fetchServices();
  }, []);

  // Загрузка списка мастеров для выбранной услуги
  useEffect(() => {
    const fetchEmployeeForService = async () => {
      try {
        console.log(selectedService);
        if (selectedService) {
          const response = await axios.get(
            `/empl/getemplbyserv/${selectedService}`
          );
          setAvailableEmployee(response.data.employeeID || []);
        }
      } catch (error) {
        console.error("Ошибка при загрузке списка мастеров:", error);
      }
    };
    fetchEmployeeForService();
  }, [selectedService]);

  useEffect(() => {
    // доступные даты из базы данных
    const fetchAvailableDates = async () => {
      try {
        if (selectedService) {
          const response = await axios.get(`/book/getdate/${selectedService}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          });
          setAvailableDates(response.data.dates || []);
          console.log(response.data.dates);
        }
      } catch (error) {
        console.error("Ошибка при загрузке доступных дат:", error);
      }
    };
    fetchAvailableDates();
  }, [selectedService]);

  // Функция для определения, является ли дата недоступной
  const shouldDisableDate = (date) => {
    // Преобразуем дату из DatePicker к ISO-формату (гггг-мм-дд)
    //const formattedDate = date.toString().split("T")[0];

    const availDate = availableDates.map((d) => new Date(d).getDate());

    //console.log("formatted date: " + formattedDate);
    // Преобразуем даты из базы данных к ISO-формату (гггг-мм-дд)
    // const availableISOdates = availableDates.map(
    //   (d) => new Date(d).toString().split("T")[0]
    // );
    //console.log("available dates: " + availableISOdates);

    return !availDate.includes(new Date(date).getDate());
    // Сравниваем даты
    //return !availableISOdates.includes(formattedDate);
  };
  //////////////////////////////////////

  /////////////вариант с карточками
  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        if (selectedDate) {
          console.log(new Date(selectedDate).getTime() + " asdasdas");
          const test = new Date(selectedDate).toLocaleDateString();
          const formattedDate = new Date(selectedDate)
            .toISOString()
            .split("T")[0];
          // console.log("asdasfasfas   " + new Date(selectedDate));
          console.log("qqqqqqqqqqqqqqq " + formattedDate);

          const timeDate = new Date(selectedDate).getTime();
          const response = await axios.get(`/book/getslots/${timeDate}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          });
          const timeSlots = response.data.timeSlots || [];

          console.log(response.data);

          // Разделяем временные слоты по мастерам
          const groupedByEmployee = timeSlots.reduce((acc, slot) => {
            const { employeeID } = slot;
            if (!acc[employeeID]) {
              acc[employeeID] = [];
            }
            acc[employeeID].push(slot);
            return acc;
          }, {});

          setAvailableTimes(groupedByEmployee);
        }
      } catch (error) {
        console.error("Ошибка при загрузке временных слотов:", error);
      }
    };

    fetchTimeSlots();
  }, [selectedDate]);

  // useEffect для загрузки мастеров, доступных в выбранную дату
  useEffect(() => {
    const fetchEmployeesForDate = async () => {
      try {
        if (selectedDate && selectedService) {
          const formattedDate = selectedDate.toISOString().split("T")[0];

          // Запрос к новому маршруту API для загрузки мастеров
          const response = await axios.get(
            `/book/getemployees/${selectedService}/${formattedDate}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
            }
          );
          console.log("Мастера:", response.data);

          const availableEmployeeForDate = response.data.employees.filter(
            (employee) => availableTimes[employee.employeeID]?.length > 0
          );

          setAvailableEmployee(availableEmployeeForDate || []);

          // Установка загруженных мастеров
          // setAvailableEmployee(response.data.employees || []);
        }
      } catch (error) {
        console.error("Ошибка при загрузке мастеров для даты:", error);
      }
    };

    fetchEmployeesForDate();
  }, [selectedDate, selectedService, availableTimes]);

  const handleTimeSlotClick = (startTime, employeeID) => {
    // Устанавливаем выбранное время и идентификатор мастера
    setSelectedTime(startTime);
    setSelectedEmployee(employeeID);
  };

  const handleSubmit = async () => {
    if (!userID) {
      console.error("User ID not found. Please authenticate first.");
      return;
    }
    const data = {
      userID,
      employeeID: selectedEmployee,
      date: new Date(selectedDate).getTime(),
      //date: selectedDate.toISOString().split("T")[0],
      startTime: selectedTime,
      notes,
    };

    try {
      const response = await axios.post("/book/booking", data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      console.log("Регистрация успешно добавлена:", response.data);
      navigate("/user");
      // Выполните действия после успешного добавления регистрации
    } catch (error) {
      console.error("Ошибка при добавлении регистрации:", error);
    }
  };

  return (
    <Container>
      <NavMenu />
      <Typography variant="h4" gutterBottom>
        Запись на услугу
      </Typography>

      {/* Выбор услуги */}
      <FormControl fullWidth className={classes.formControl}>
        <InputLabel id="service-label">Услуги</InputLabel>
        <Select
          labelId="service-label"
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          displayEmpty
        >
          <MenuItem value="">
            <em>Выберите услугу</em>
          </MenuItem>
          {availableServices &&
            Array.isArray(availableServices) &&
            availableServices.map((service) => (
              <MenuItem key={service.id} value={service.id}>
                {service.name}
              </MenuItem>
            ))}
        </Select>
      </FormControl>

      {/* Выбор даты */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <FormControl fullWidth>
          <DatePicker
            label="Дата"
            value={selectedDate}
            onChange={setSelectedDate}
            shouldDisableDate={shouldDisableDate}
            renderInput={(params) => <TextField {...params} />}
          />
        </FormControl>
      </LocalizationProvider>

      <div>
        {/* Карточки мастеров */}
        {availableEmployee.map((employee) => {
          //  const timeSlots = availableTimes[employee.employeeID];

          return (
            <EmployeeCard
              key={employee.employeeID}
              name={`${employee.name} ${employee.surname}`}
              employeeID={employee.employeeID}
              timeSlots={availableTimes[employee.employeeID] || []}
              selectedTime={selectedTime} // Передаем `selectedTime` как пропс
              onTimeSlotClick={handleTimeSlotClick}
            />
          );
        })}
      </div>
      {/* Поле для заметок */}
      <TextField
        label="Заметки"
        fullWidth
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className={classes.formControl}
      />

      {/* Кнопка отправки формы */}
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
