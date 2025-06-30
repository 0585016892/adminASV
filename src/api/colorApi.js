// src/api/colorApi.js
import axios from "axios";

const API_URL = "http://localhost:5000/api"; // Đổi lại nếu cần

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
export const createColor = (token, colorData) => {
  return axios.post(API_URL, colorData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Cập nhật màu
export const updateColor = (token, id, colorData) => {
  return axios.put(`${API_URL}/colors/${id}`, colorData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Xóa màu
export const deleteColor = (token, id) => {
  return axios.delete(`${API_URL}/colors/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
