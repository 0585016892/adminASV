import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Spinner from "../components/Spinner";
const RoleRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />; // ✅ Chờ xác minh đăng nhập
  if (!user) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RoleRoute;
