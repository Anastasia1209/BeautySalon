import React, { useState } from "react";
import {
  LocalizationProvider,
  DatePicker,
  TimeField,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Grid, TextField } from "@mui/material";

function DateTimePicker({ index, onUpdateSchedule }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedStartTime, setSelectedStartTime] = useState(null);
  const [selectedEndTime, setSelectedEndTime] = useState(null);

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    onUpdateSchedule(index, "date", newDate);
  };

  const handleStartTimeChange = (newTime) => {
    setSelectedStartTime(newTime);
    onUpdateSchedule(index, "startTime", newTime);
  };

  const handleEndTimeChange = (newTime) => {
    setSelectedEndTime(newTime);
    onUpdateSchedule(index, "endTime", newTime);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid container spacing={2}>
        {/* Выбор даты */}
        <Grid item xs={4}>
          <DatePicker
            label="Выберите день"
            value={selectedDate}
            onChange={handleDateChange}
            renderInput={(props) => <TextField {...props} />}
          />
        </Grid>

        {/* Выбор времени начала */}
        <Grid item xs={4}>
          <TimeField
            label="Время начала"
            value={selectedStartTime}
            format="HH:mm"
            onChange={handleStartTimeChange}
          />
        </Grid>

        {/* Выбор времени окончания */}
        <Grid item xs={4}>
          <TimeField
            label="Время окончания"
            value={selectedEndTime}
            format="HH:mm"
            onChange={handleEndTimeChange}
          />
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
}

export default DateTimePicker;
