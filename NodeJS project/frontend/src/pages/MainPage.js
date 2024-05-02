import React from "react";
//import MainPost from "../src/components/MainPost";
import MainPost from "../components/MainPost";
import NavMenu from "../components/NavMenu";
import { Container } from "@material-ui/core";

function MainPage() {
  const post = {
    title: "Добро пожаловать в салон красоты!",
    description: "Насладитесь лучшим сервисом в нашем городе",
    image: "https://source.unsplash.com/random",
    imageText: "salon",
  };
  const sections = [
    { title: "Цены и услуги", url: "/services" },
    { title: "Отзывы", url: "#" },
    { title: "Админ", url: "/admin" },
    { title: "User", url: "/user" },
  ];
  return (
    <div className="App">
      <Container>
        <NavMenu sections={sections} />
        <MainPost post={post} />
      </Container>
    </div>
  );
}
export default MainPage;
