// src/api/settingsAPI.js
import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL; 

// Lấy settings từ backend
export const getSettingsAPI = async () => {
  try {
    const res = await axios.get(`${API_URL}/settings`);
    // backend trả về object { smtp_host, smtp_port, smtp_username, smtp_password, site_name }
    return res.data;
  } catch (err) {
    console.error("Lỗi khi lấy settings:", err);
    throw err;
  }
};

// Cập nhật settings
export const updateSettingsAPI = async (settings) => {
  try {
    const res = await axios.put(`${API_URL}/settings`, settings);
    return res.data;
  } catch (err) {
    console.error("Lỗi khi cập nhật settings:", err);
    throw err;
  }
};
// Cập nhật settings + upload file
export const updateSettingsWithFilesAPI = async (formData) => {
  try {
    const res = await fetch(`${API_URL}/settings`, {
      method: "PUT",
      body: formData, // fetch tự set multipart/form-data
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Cập nhật settings thất bại");
    }

    return res.json();
  } catch (err) {
    console.error("Lỗi khi cập nhật settings:", err);
    throw err;
  }
};