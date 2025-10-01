import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Alert, InputGroup, Image } from "react-bootstrap";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import "../assets/Login.css";
import logo from "../img/logo.png";

export default function Login() {
  const API_URL_LOGIN = process.env.REACT_APP_API_URL;
  const { login } = useAuth();
  const [email, setEmail] = useState(localStorage.getItem("rememberEmail") || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setShake(false);
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL_LOGIN}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Đăng nhập thất bại");
        setShake(true);
        setIsLoading(false);
        return;
      }

      login({ user: data.user, token: data.token, role: data.role });
      remember ? localStorage.setItem("rememberEmail", email) : localStorage.removeItem("rememberEmail");
      setIsLoading(false);
      navigate("/");
    } catch {
      setError("Lỗi mạng hoặc server");
      setShake(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!shake) return;
    let mounted = true;
    const timer = setTimeout(() => {
      if (mounted) setShake(false);
    }, 500);
    return () => { mounted = false; clearTimeout(timer); };
  }, [shake]);

  return (
    <div className="login-wrapper">
      <div className={`login-box shadow-sm ${shake ? "shake" : ""}`}>
        <div className="text-center mb-4">
          <Image src={logo} alt="Logo" className="login-logo" />
          <h3>Quản trị viên</h3>
          <small className="text-muted">Đăng nhập để quản lý hệ thống</small>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3 position-relative">
            <Form.Label>Mật khẩu</Form.Label>
            <Form.Control
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="pr-5"
            />
            <span className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </Form.Group>

          <Form.Group className="mb-4 d-flex align-items-center justify-content-between">
            <Form.Check
              type="checkbox"
              label="Ghi nhớ email"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
          </Form.Group>

          <Button type="submit" className="w-100 btn-login" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Đang đăng nhập...
              </>
            ) : (
              "Đăng nhập"
            )}
          </Button>
        </Form>
      </div>
    </div>
  );
}
