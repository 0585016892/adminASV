// src/api/employeeApi.js
import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const getEmployees = (token) => {
  return axios.get(`${API_URL}/employees/employees`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Tạo mới nhân viên
export const createEmployee = async (token, data) => {
  return await axios.post(`${API_URL}/employees/employees`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

// Cập nhật thông tin nhân viên
export const updateEmployee = async (token, id, data) => {
  return await axios.put(`${API_URL}/employees/employees/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
};
// Xóa nhân viên
export const deleteEmployee = (token, id) => {
  return axios.delete(`${API_URL}/employees/employees/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
