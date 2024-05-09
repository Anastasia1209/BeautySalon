import React, { useState } from "react";
import ServiceForm from "../components/ServiceForm"; // Импорт компонента ServiceForm
import axios from "axios";
import { Typography } from "@material-ui/core";
import NavMenu from "../components/NavMenu";
import { useNavigate } from "react-router-dom";

function AddServiceForm() {
  const [errorMessage, setErrorMessage] = useState(""); // Состояние для ошибок
  const navigate = useNavigate();

  const handleSubmit = async (serviceData, mode) => {
    try {
      const response = await axios.post("/serv/addservice", serviceData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      console.log("Услуга успешно добавлена:", response.data.newService);
      navigate("/services");
    } catch (error) {
      console.error("Ошибка при добавлении услуги:", error);
      setErrorMessage(
        error.response?.data?.error || "Ошибка при добавлении услуги."
      );
    }
  };

  return (
    <div>
      <NavMenu />
      <ServiceForm
        initialName=""
        initialDescription=""
        initialPrice={0}
        mode="add"
        onSubmit={handleSubmit}
      />

      {errorMessage && (
        <Typography color="error" gutterBottom>
          {errorMessage}
        </Typography>
      )}
    </div>
  );
}

export default AddServiceForm;

// import React, { useState } from "react";
// import { Button, Container, TextField, Typography } from "@material-ui/core";
// import { makeStyles } from "@material-ui/core/styles";
// import axios from "axios";

// const useStyles = makeStyles((theme) => ({
//   formControl: {
//     marginBottom: theme.spacing(2),
//   },
//   button: {
//     marginTop: theme.spacing(3),
//   },
// }));

// function AddServiceForm() {
//   const classes = useStyles();

//   // Состояния для данных формы
//   const [name, setName] = useState("");
//   const [description, setDescription] = useState("");
//   const [price, setPrice] = useState("");
//   const [error, setError] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     // Обработка отправки данных на сервер
//     // Валидируйте данные формы
//     if (!name || price <= 0) {
//       console.error("Bведите корректные данные.");
//       return;
//     }

//     const serviceData = {
//       name,
//       description,
//       price,
//     };

//     try {
//       // Отправляем POST-запрос на сервер
//       const response = await axios.post("/serv/addservice", serviceData, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("authToken")}`,
//         },
//       });

//       console.log("Услуга успешно добавлена:", response.data);

//       // Сброс формы после успешного добавления
//       setName("");
//       setDescription("");
//       setPrice("");
//       setError("");
//     } catch (error) {
//       console.error("Ошибка при добавлении услуги:", error);
//       setError(error.response?.data?.error || "Ошибка при добавлении услуги");
//     }
//   };

//   return (
//     <Container>
//       <Typography variant="h4" gutterBottom>
//         Добавить услугу
//       </Typography>
//       <form>
//         <TextField
//           fullWidth
//           label="Название услуги"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           className={classes.formControl}
//         />
//         <TextField
//           fullWidth
//           label="Описание услуги"
//           multiline
//           rows={3}
//           value={description}
//           onChange={(e) => setDescription(e.target.value)}
//           className={classes.formControl}
//         />
//         <TextField
//           fullWidth
//           label="Цена услуги"
//           type="number"
//           value={price}
//           onChange={(e) => setPrice(e.target.value)}
//           className={classes.formControl}
//         />
//         {/* Вывод сообщения об ошибке */}
//         {error && <Typography color="error">{error}</Typography>}

//         <Button
//           variant="contained"
//           color="primary"
//           onClick={handleSubmit}
//           className={classes.button}
//         >
//           Добавить услугу
//         </Button>
//       </form>
//     </Container>
//   );
// }

// export default AddServiceForm;
