// src/utils/toastUtils.js
import { toast } from "react-hot-toast";
import { 
  AiOutlineCheckCircle, 
  AiOutlineCloseCircle, 
  AiOutlineInfoCircle 
} from "react-icons/ai";
import React from "react";

/**
 * Cấu hình Style chung cho Toast để đảm bảo tính thẩm mỹ "Acoustic"
 */
const toastStyles = {
  container: {
    background: "#fff",
    borderRadius: "12px",
    padding: "16px",
    width: "350px",
    display: "flex",
    gap: "12px",
    alignItems: "flex-start", // Để text dài không bị lệch icon
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    border: "1px solid #f0ece1",
  },
  title: {
    display: "block",
    color: "#1a1a1a",
    fontWeight: "600",
    fontSize: "15px",
    marginBottom: "2px",
  },
  message: {
    display: "block",
    color: "#666",
    fontSize: "13px",
    lineHeight: "1.4",
  },
  progress: (color) => ({
    position: "absolute",
    bottom: 0,
    left: 0,
    height: "3px",
    width: "100%",
    backgroundColor: color,
    animation: "progressSlide 4s linear forwards",
  })
};

// 1. Success Toast (Màu xanh lá nhẹ/Acoustic Green)
export const showSuccessToast = (title, message) => {
  toast.custom((t) => (
    <div
      style={{
        ...toastStyles.container,
        borderLeft: "5px solid #52c41a",
        transform: t.visible ? "translateY(0)" : "translateY(-20px)",
        opacity: t.visible ? 1 : 0,
        transition: "all 0.3s ease",
      }}
    >
      <AiOutlineCheckCircle size={22} color="#52c41a" style={{ marginTop: "2px" }} />
      <div style={{ flex: 1 }}>
        <span style={toastStyles.title}>{title}</span>
        <span style={toastStyles.message}>{message}</span>
      </div>
      <div style={toastStyles.progress("#52c41a")} />
    </div>
  ), { duration: 4000 });
};

// 2. Error Toast (Màu đỏ san hô)
export const showErrorToast = (title, message) => {
  toast.custom((t) => (
    <div
      style={{
        ...toastStyles.container,
        borderLeft: "5px solid #ff4d4f",
        transform: t.visible ? "translateY(0)" : "translateY(-20px)",
        opacity: t.visible ? 1 : 0,
        transition: "all 0.3s ease",
      }}
    >
      <AiOutlineCloseCircle size={22} color="#ff4d4f" style={{ marginTop: "2px" }} />
      <div style={{ flex: 1 }}>
        <span style={toastStyles.title}>{title}</span>
        <span style={toastStyles.message}>{message}</span>
      </div>
      <div style={toastStyles.progress("#ff4d4f")} />
    </div>
  ), { duration: 4000 });
};

// 3. Info Toast (Màu xanh dương nhẹ - Tiện cho các thông báo hệ thống)
export const showInfoToast = (title, message) => {
  toast.custom((t) => (
    <div
      style={{
        ...toastStyles.container,
        borderLeft: "5px solid #1890ff",
        transform: t.visible ? "translateY(0)" : "translateY(-20px)",
        opacity: t.visible ? 1 : 0,
        transition: "all 0.3s ease",
      }}
    >
      <AiOutlineInfoCircle size={22} color="#1890ff" style={{ marginTop: "2px" }} />
      <div style={{ flex: 1 }}>
        <span style={toastStyles.title}>{title}</span>
        <span style={toastStyles.message}>{message}</span>
      </div>
      <div style={toastStyles.progress("#1890ff")} />
    </div>
  ), { duration: 4000 });
};