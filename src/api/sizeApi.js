import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL; // Cập nhật URL nếu khác

// Lấy danh sách size có phân trang
export const getSizes = (token, page = 1, limit = 5) => {
  return axios.get(`${API_URL}/size?page=${page}&limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Thêm size mới
export const createSize = (token, data) => {
  return axios.post(`${API_URL}/size`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Cập nhật size theo ID
export const updateSize = (token, id, data) => {
  return axios.put(`${API_URL}/size/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Xoá size theo ID
export const deleteSize = (token, id) => {
  return axios.delete(`${API_URL}/size/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Import danh sách size từ file Excel
export const importSizes = (token, sizesArray) => {
  return axios.post(
    `${API_URL}/size/import`,
    { sizes: sizesArray },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
export const getAllSizes = (token) => {
  return axios.get(`${API_URL}/size/all`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
