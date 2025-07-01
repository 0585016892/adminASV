import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Alert, InputGroup } from "react-bootstrap";
import { BsEyeFill, BsEyeSlashFill } from "react-icons/bs";
import { useAuth } from "../contexts/AuthContext"; // import hook
import "../assets/Login.css";
export default function Login() {
  const API_URL_LOGIN = process.env.REACT_APP_API_URL; // Cập nhật URL nếu khác

  const { login } = useAuth(); // lấy login từ context
  const [email, setEmail] = useState(
    localStorage.getItem("rememberEmail") || ""
  );
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
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
        setIsLoading(false);
        return;
      }

      // Gọi login của context, truyền user + token + role
      login({
        user: data.user,
        token: data.token,
        role: data.role,
      });

      // Ghi nhớ email nếu checkbox checked, hoặc xóa nếu không
      if (remember) {
        localStorage.setItem("rememberEmail", email);
      } else {
        localStorage.removeItem("rememberEmail");
      }
      setIsLoading(false);
      navigate("/"); // chuyển trang
    } catch (err) {
      setError("Lỗi mạng hoặc server");
      setIsLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-start align-items-center vh-100 login_bg">
      <Form
        onSubmit={handleSubmit}
        className="p-4 shadow bg-white rounded"
        style={{ minWidth: 500, height: 400 }}
      >
        <h3 className="text-center mb-4">Đăng nhập quản trị</h3>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form.Group controlId="formEmail" className="mb-4">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Nhập email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="formPassword" className="mb-4">
          <Form.Label>Mật khẩu</Form.Label>
          <InputGroup>
            <Form.Control
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <Button
              variant="toggle-password-icon"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <BsEyeSlashFill /> : <BsEyeFill />}
            </Button>
          </InputGroup>
        </Form.Group>

        <Form.Group className="mb-4" controlId="formRemember">
          <Form.Check
            type="checkbox"
            label="Ghi nhớ email"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
        </Form.Group>

        <button
          type="submit"
          className="btn btn-primary w-100"
          style={{ marginTop: 20 }}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>{" "}
              Đang đăng nhập...
            </>
          ) : (
            "Đăng nhập"
          )}
        </button>
      </Form>
    </div>
  );
}
