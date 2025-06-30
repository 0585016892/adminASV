import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";
export const getAllProducts = async (page, limit) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products`, {
      params: { page, limit },
    });
    return response.data; // Trả về dữ liệu phân trang
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm:", error);
    return { products: [], totalProducts: 0, totalPages: 1 };
  }
};
// Thêm sản phẩm mới
export const addProduct = async (productData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/products/add`,
      productData
    );
    return response.data; // Trả về dữ liệu sản phẩm vừa được thêm
  } catch (error) {
    console.error("Lỗi khi thêm sản phẩm:", error);
    throw new Error("Không thể thêm sản phẩm");
  }
};
// API xóa sản phẩm
export const deleteProduct = async (id) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/products/delete/${id}`
    );
    return response.data; // Trả về dữ liệu từ server
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm:", error);
    throw new Error("❌ Lỗi khi xóa sản phẩm");
  }
};
// API để lấy thông tin sản phẩm theo ID
export const getProductById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products/${id}`);
    return response.data; // Trả về dữ liệu sản phẩm
  } catch (error) {
    throw new Error("Không thể lấy thông tin sản phẩm.");
  }
};

// API để cập nhật thông tin sản phẩm
export const updateProduct = async (id, formData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/update/${id}`, {
      method: "PUT",
      body: formData,
    });
    if (!response.ok) {
      const errorDetail = await response.text();
      throw new Error(`Không thể cập nhật sản phẩm. Chi tiết: ${errorDetail}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Lỗi API:", error);
    throw new Error("Không thể cập nhật sản phẩm.");
  }
};
// API lọc sản phẩm theo nhiều điều kiện
export const filterProducts = async (filters) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products`, {
      params: {
        page: filters.page || 1,
        limit: filters.limit || 10,
        keyword: filters.keyword || "",
        categoryId: filters.categoryId || "",
        dateRange: filters.dateRange || "",
        productType: filters.productType || "",
        status: filters.status || "",
        seoScore: filters.seoScore || "",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lọc sản phẩm:", error);
    return { products: [], totalProducts: 0, totalPages: 1 };
  }
};
export const getCategories = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products/danhmuc`);
    return response.data.categories;
  } catch (error) {
    console.error("Lỗi khi lấy danh mục:", error);
    throw error;
  }
};
export const getCoupons = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/coupons`);
    return response.data; // Lấy dữ liệu từ response
  } catch (error) {
    console.error("Lỗi khi lấy mã giảm giá:", error);
    throw error; // Nếu có lỗi, throw để biết vấn đề
  }
};
export const getAllSizes = (token) => {
  return axios.get(`${API_BASE_URL}/size/all`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const getAllColors = (token) => {
  return axios.get(`${API_BASE_URL}/colors/all`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
