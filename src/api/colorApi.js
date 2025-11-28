// src/api/colorApi.js
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL; // Đổi lại nếu cần

// Lấy danh sách màu có phân trang
export const getColors = (token, page = 1, limit = 15) => {
  return axios.get(`${API_URL}/colors?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Lấy tất cả màu (không phân trang, dùng cho export hoặc dropdown)
export const getAllColors = (token) => {
  return axios.get(`${API_URL}/colors/all`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Tạo mới màu
export const createColor = (token, colorData, userID) => {
  const data = { ...colorData, userID }; // gộp userID vào body
  return axios.post(`${API_URL}/colors/`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Cập nhật màu
export const updateColor = (token, id, colorData, userID) => {
  const data = { ...colorData, userID }; // gộp userID vào body
  return axios.put(`${API_URL}/colors/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
// Xóa màu
export const deleteColor = (token, id, userID) => {
  return axios.delete(`${API_URL}/colors/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { userID },   // body DELETE phải nằm trong config.data
  });
};
