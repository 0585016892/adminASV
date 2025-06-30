import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");

    if (storedUser && storedToken && storedRole) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      setRole(storedRole);
    }
    setLoading(false);
  }, []);

  const login = ({ user, token, role }) => {
    setUser(user);
    setToken(token);
    setRole(role);

    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRole(null);

    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  };

  return (
    <AuthContext.Provider value={{ user, token, role, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
