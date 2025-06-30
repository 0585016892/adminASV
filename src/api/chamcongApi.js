import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL;

// Lấy dữ liệu chấm công theo ngày (YYYY-MM-DD)
export const getChamCongByDate = async (date) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/chamcong/date/${date}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu chấm công theo ngày:", error);
    return { success: false, error };
  }
};

// Xuất file Excel chấm công theo tháng (YYYY-MM)
export const exportChamCongByMonth = async (month) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/chamcong/export/${month}`,
      { responseType: "blob" } // để tải file
    );

    // Tự động tải file về
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `chamcong-${month}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    return { success: true };
  } catch (error) {
    console.error("Lỗi khi xuất file chấm công:", error);
    return { success: false, error };
  }
};

// Lọc chấm công theo tên + phân trang
export const filterChamCong = async ({ name = "", page = 1, limit = 10 }) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/chamcong/filter`, {
      params: { name, page, limit },
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Lỗi khi lọc chấm công:", error);
    return { success: false, error };
  }
};
export const getSalarySummary = (user_id, year, month) => {
  return axios.get(`${API_BASE_URL}/attendances/salary`, {
    params: { user_id, year, month },
  });
};
export const saveSalary = (data) =>
  axios.post(`${API_BASE_URL}/attendances/save`, data);
export const checkSalarySaved = async (user_id, year, month) => {
  const res = await axios.get(`${API_BASE_URL}/attendances/check`, {
    params: { user_id, year, month },
  });
  return res.data;
};
