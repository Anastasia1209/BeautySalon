import React from "react";
import "./App.css";
import RegistrationForm from "../src/pages/Registr";
import LoginForm from "../src/pages/Login";
import MainPost from "../src/components/MainPost";
import ServicesPage from "../src/pages/ServicePage";
import NavMenu from "../src/components/NavMenu";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { Container } from "@material-ui/core";
import BookingForm from "./pages/BookForm";
import AddMasterForm from "./pages/AddEmployee";
import AddServiceForm from "./pages/AddService";

// const useStyles = makeStyles((theme) => ({
//   root: {
//     flexGrow: 1,
//   },
//   title: {
//     flexGrow: 1,
//     justifyContent: "space-between",
//     textAlign: "left",
//     textDecoration: "none",
//     color: "#ffffff",
//   },
//   button: {
//     color: "#ffffff",
//   },
// }));

function App() {
  //  const classes = useStyles();
  const post = {
    title: "Добро пожаловать в салон красоты!",
    description: "Насладитесь лучшим сервисом в нашем городе",
    image: "https://source.unsplash.com/random",
    imageText: "salon",
    linkText: "Learn More",
  };
  return (
    <div className="App">
      <Container>
        <NavMenu />
        <MainPost post={post} />
        <RegistrationForm />
        <LoginForm />
        <ServicesPage />
        <BookingForm />
        <AddMasterForm />

        <AddServiceForm></AddServiceForm>
      </Container>
    </div>
  );
}

export default App;
