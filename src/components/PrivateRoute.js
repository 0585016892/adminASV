import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    // nếu chưa login => redirect về login
    return <Navigate to="/login" replace />;
  }
  // nếu có token thì cho phép truy cập
  return children;
};

export default PrivateRoute;
