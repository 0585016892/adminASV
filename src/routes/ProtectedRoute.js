import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Đang kiểm tra đăng nhập...</div>; // hoặc spinner
  // Chưa đăng nhập => redirect về login
  if (!user) return <Navigate to="/login" replace />;
  // Đã đăng nhập => render component con
  return children;
};

export default PrivateRoute;
