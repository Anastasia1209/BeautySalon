import React, { useState, useEffect } from "react";
import "./App.css";
import RegistrationForm from "../src/pages/Registr";
import LoginForm from "../src/pages/Login";
import ServicesPage from "../src/pages/ServicePage";
import { Container } from "@material-ui/core";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MainPage from "./pages/MainPage";
import AdminPage from "./pages/AdminPage";
import UserPage from "./pages/UserPage";
import EmployeePage from "./pages/EmployeePage";
import EditService from "./pages/EditService";
import EditEmployee from "./pages/EditEmployee";
import ReviewPage from "./pages/ReviewPage";
import BookingForm from "./pages/BookForm";
import AddEmployee from "./pages/AddEmployee";
import AddService from "./pages/AddService";
import NotFoundPage from "./pages/404";
import { jwtDecode } from "jwt-decode";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("USER");
  // useEffect(() => {
  //   // Проверка аутентификации пользователя
  //   const authToken = localStorage.getItem("authToken");
  //   setIsAuthenticated(!!authToken);
  // }, []);
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        setIsAuthenticated(true);
        const decodedToken = jwtDecode(token);
        if (decodedToken && decodedToken.role) {
          setUserRole(decodedToken.role);
        }
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <div className="App">
      <Container>
        <Routes>
          <Route path="/main" element={<MainPage />} />
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/serv/updserv/:id" element={<EditService />} />
          <Route path="/serv/addserv" element={<AddService />} />
          <Route path="/user" element={<UserPage />} />
          <Route path="/employees" element={<EmployeePage />} />
          <Route path="/empl/updempl/:id" element={<EditEmployee />} />
          <Route path="/empl/addempl" element={<AddEmployee />} />
          <Route path="/rev/getrewempl/:id" element={<ReviewPage />} />
          <Route
            path="/bookingform"
            element={isAuthenticated ? <BookingForm /> : <LoginForm />}
          />{" "}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Container>
    </div>
  );
}

export default App;
