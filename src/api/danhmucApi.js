import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL;
export const getParentCategories = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/categories/parents`);
    return response.data; // Trả về mảng danh mục cha
  } catch (error) {
    console.error("Lỗi khi lấy danh mục cha:", error);
    return [];
  }
};
export const getAllDanhMuc = async (page, limit) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/categories`, {
      params: { page, limit },
    });
    return response.data; // Trả về dữ liệu phân trang
  } catch (error) {
    console.error("Lỗi khi lấy danh mục:", error);
    return { danhmuc: [], totalCategories: 0, totalPages: 1 };
  }
};
export const getDanhMucById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/categories/${id}`);
    return response.data; // Trả về dữ liệu danh mục
  } catch (error) {
    throw new Error("Không thể lấy thông tin danh mục.");
  }
};
// API lọc danh mục theo nhiều điều kiện
export const filterDanhmuc = async (filters) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/categories`, {
      params: {
        page: filters.page || 1,
        limit: filters.limit || 10,
        keyword: filters.keyword || "",
        status: filters.status || "",
        seoScore: filters.seoScore || "",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lọc danh mục:", error);
    return { danhmuc: [], totalCategories: 0, totalPages: 1 };
  }
};
// API xóa dm
export const deleteDanhMuc = async (id, userID) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/categories/delete/${id}`,
      {
        data: { userID }, // <== BODY ĐỂ GHI LOG
      }
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa danh mục:", error);
    throw new Error("❌ Lỗi khi xóa danh mục");
  }
};


// Thêm  mới
export const addDanhmuc = async (data) => {
  try {
    // Check if data is an array (for bulk add)
    if (Array.isArray(data)) {
      const response = await axios.post(
        `${API_BASE_URL}/categories/bulk-add`, // Create a bulk API endpoint
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } else {
      // Single category add logic (as before)
      const response = await axios.post(
        `${API_BASE_URL}/categories/add`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    }
  } catch (error) {
    console.error("Error adding category:", error);
    throw error;
  }
};

export const updateDanhMuc = async (id, jsonData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/update/${id}`, {
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
