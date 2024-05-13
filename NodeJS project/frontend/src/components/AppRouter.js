import React from "react";
import { Route, Navigate } from "react-router-dom";

const AppRouter = ({ isAuthenticated, ...props }) => {
  if (isAuthenticated) {
    return <Route {...props} />;
  } else {
    return <Navigate to="/login" />;
  }
};

export default AppRouter;
