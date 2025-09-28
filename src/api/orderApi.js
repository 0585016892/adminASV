import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL;

// API lọc đơn hàng theo nhiều điều kiện

export const filterOrders = async (filters) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/orders`, {
      params: {
        page: filters.page || 1,
        limit: filters.limit || 15,
        keyword: filters.keyword || "",
        status: filters.status || "",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lọc đơn hàng:", error);
    return { orders: [], totalOrders: 0, totalPages: 1, currentPage: 1 };
  }
};

export const getOrdersWithFilter = async ({
  page = 1,
  limit = 8,
  ...filters
} = {}) => {
  try {
    // Kiểm tra xem có lọc theo từ khóa (keyword) và trạng thái (status) không, nếu có thêm vào params
    const params = {
      page,
      limit,
      keyword: filters.keyword || "", // Thêm từ khóa vào params nếu có
      status: filters.status || "", // Thêm trạng thái vào params nếu có
    };

    const response = await axios.get(`${API_BASE_URL}/orders`, {
      params, // Thêm params vào để backend nhận được
    });

    const { orders, totalOrders, totalPages, currentPage } = response.data;

    return {
      orders,
      totalOrders,
      totalPages,
      currentPage,
    };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn hàng:", error);
    throw error;
  }
};

export const deleteOrderById = async (id) => {
  const res = await axios.delete(`${API_BASE_URL}/orders/delete/${id}`);
  return res.data;
};
// ✅ Cập nhật trạng thái đơn hàng
export const updateOrderStatus = async (orderId, newStatus) => {
  const response = await axios.put(`${API_BASE_URL}/orders/${orderId}/status`, {
    status: newStatus,
  });
  return response.data;
};

export const getOrderDetails = async (orderId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/orders/acv/${orderId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      "Không thể lấy thông tin chi tiết đơn hàng: " + error.message
    );
  }
};
