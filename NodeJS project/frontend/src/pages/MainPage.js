import React, { useState, useEffect } from "react";
//import MainPost from "../src/components/MainPost";
import MainPost from "../components/MainPost";
import NavMenu from "../components/NavMenu";
import { Container } from "@material-ui/core";
import { jwtDecode } from "jwt-decode";

function MainPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("USER");

  useEffect(() => {
    // Замените эту проверку вашей логикой проверки аутентификации.
    const checkAuth = () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        setIsAuthenticated(true);
        // Расшифруйте токен, чтобы получить роль пользователя
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

  const post = {
    title: "Добро пожаловать в салон красоты!",
    description: "Насладитесь лучшим сервисом в нашем городе",
    image: "https://source.unsplash.com/random",
    imageText: "salon",
  };

  const sections = [
    { title: "Услуги", url: "/services" },
    { title: "Отзывы", url: "/review" },
  ];

  const sectionsAdmin = [
    { title: "Услуги", url: "/services" },
    { title: "Сотрудники", url: "/employees" },
    { title: "Админ", url: "/admin" },
  ];

  const buttonPath = isAuthenticated ? "/user" : "/login";
  const buttonText = isAuthenticated ? "Профиль" : "Вoйти";

  return (
    <div className="App">
      <Container>
        <NavMenu
          sections={userRole === "ADMIN" ? sectionsAdmin : sections}
          buttonPath={buttonPath}
          buttonText={buttonText}
        />
        <MainPost post={post} />
      </Container>
    </div>
  );
}
export default MainPage;
