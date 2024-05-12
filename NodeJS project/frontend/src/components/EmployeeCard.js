import React, { useState } from "react";
import { Card, CardContent, Typography, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/ru";

dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.locale("ru");

const useStyles = makeStyles((theme) => ({
  card: {
    marginBottom: theme.spacing(2),
  },
  timeButton: {
    margin: theme.spacing(0.5),
    "&.selected": {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.common.white,
    },
  },
}));

// Компонент для отображения мастера с доступными временами
const EmployeeCard = ({
  name,
  surname,
  employeeID,
  timeSlots,
  selectedTime,
  onTimeSlotClick,
}) => {
  const classes = useStyles();

  const [localSelectedTime, setLocalSelectedTime] = useState(selectedTime);
  const handleTimeSlotClick = (time) => {
    // Если текущее время равно времени на кнопке, то отменяем выбор
    if (localSelectedTime === time) {
      setLocalSelectedTime(null);
    } else {
      setLocalSelectedTime(time);
    }
    onTimeSlotClick(time, employeeID);
  };

  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography variant="h6">{name}</Typography>
        <div>
          {timeSlots.map((slot) => (
            <Button
              key={slot.id}
              variant="outlined"
              color="inherit"
              className={`${classes.timeButton} ${
                slot.startTime === localSelectedTime ? "selected" : ""
              }`}
              //  onClick={() => onTimeSlotClick(slot.startTime)}
              // onClick={() => {
              //   console.log(
              //     "Нажатие на время:",
              //     slot.startTime,
              //     "для мастера:",
              //     employeeID
              //   );
              //   onTimeSlotClick(slot.startTime, employeeID);
              // }}
              onClick={() => {
                console.log(
                  "Нажатие на время:",
                  slot.startTime,
                  "для мастера:",
                  employeeID
                );
                handleTimeSlotClick(slot.startTime);
              }}
            >
              {dayjs(slot.startTime).tz("UTC", true).format("HH:mm")}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeCard;
