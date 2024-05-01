import React from "react";
//import MainPost from "../src/components/MainPost";
import MainPost from "../components/MainPost";
import NavMenu from "../components/NavMenu";
import { Container } from "@material-ui/core";
import AddServiceForm from "./AddService";

function AdminPage() {
  const sections = [
    { title: "Услуги", url: "/services" },
    { title: "Отзывы", url: "#" },
    { title: "Сотрудники", url: "#" },
    //  { title: "", url: "#"},
  ];
  return (
    <div className="App">
      <Container>
        <NavMenu sections={sections} />
        <AddServiceForm />
      </Container>
    </div>
  );
}
export default AdminPage;
