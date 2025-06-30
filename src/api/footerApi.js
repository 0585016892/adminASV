import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL; // Đảm bảo rằng địa chỉ này đúng với backend của bạn

// Lấy danh sách footer
export const getFooters = async ({ page, limit, keyword }) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/footer`, {
      params: { page, limit, keyword },
    });
    return res.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách footer:", error);
    throw new Error("Không thể lấy danh sách footer.");
  }
};

// Xóa footer theo ID
export const deleteFooterById = async (id) => {
  try {
    return await axios.delete(`${API_BASE_URL}/footer/delete/${id}`);
  } catch (error) {
    console.error("Lỗi khi xóa footer:", error);
    throw new Error("Không thể xóa footer.");
  }
};
// Cập nhật trạng thái của footer
export const updateFooterStatus = async (id, newStatus) => {
  try {
    const response = await fetch(`${API_BASE_URL}/footer/status/${id}`, {
      method: "PATCH", // Cập nhật bằng PATCH
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus }), // Gửi trạng thái mới
    });

    if (!response.ok) {
      throw new Error("Không thể cập nhật trạng thái.");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Lỗi API:", error);
    throw new Error("Lỗi khi cập nhật trạng thái.");
  }
};

export const addFooterItem = async (data) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/footer/add`, data);
    return res.data;
  } catch (error) {
    console.error("Lỗi khi thêm footer:", error);
    throw new Error("Không thể thêm footer.");
  }
};
// Lấy danh sách footer cha
export const getFooterParents = async () => {
  const res = await axios.get(`${API_BASE_URL}/footer/parents`);
  return res.data;
};
// Giả định có API để thêm danh mục con
export const addFooterChild = async (childData) => {
  const response = await axios.post(`${API_BASE_URL}/footer/add`, childData);
  return response.data;
};
export const getFooterById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/footer/${id}`);
    return response.data; // Trả về dữ liệu danh mục
  } catch (error) {
    throw new Error("Không thể lấy thông tin.");
  }
};
export const updateFooter = async (id, jsonData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/footer/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonData), // Gửi dữ liệu dưới dạng JSON
    });

    if (!response.ok) {
      const errorDetail = await response.text();
      throw new Error(`Không thể cập nhật danh mục. Chi tiết: ${errorDetail}`);
    }

    const data = await response.json();
    return data; // Trả về dữ liệu cho frontend xử lý
  } catch (error) {
    console.error("Lỗi API:", error);
    throw new Error("Không thể cập nhật danh mục.");
  }
};

// // Cập nhật footer
// export const updateFooter = async (footerId, formData) => {
//   try {
//     const response = await axios.put(
//       `${API_BASE_URL}/footers/update/${footerId}`,
//       formData,
//       {
//         headers: {
//           "Content-Type": "multipart/form-data", // Đảm bảo gửi file (nếu có) đúng định dạng
//         },
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Lỗi khi cập nhật footer:", error);
//     throw new Error("Cập nhật footer thất bại");
//   }
// };

// // Lấy thông tin footer theo ID
// export const getFooterById = async (id) => {
//   try {
//     const response = await axios.get(`${API_BASE_URL}/footer/${id}`);
//     return response.data; // Trả về dữ liệu Footer
//   } catch (error) {
//     console.error("Lỗi khi lấy thông tin footer:", error);
//     throw new Error("Không thể lấy thông tin footer");
//   }
// };
