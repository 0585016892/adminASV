import axios from "axios";
const API_BASE_URL = process.env.REACT_APP_API_URL;

// Lọc coupon
export const filterCoupon = async (filters) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/coupons`, {
      params: {
        page: filters.page || 1,
        limit: filters.limit || 10,
        code: filters.keyword || "", // Tìm kiếm theo mã coupon (code)
        status: filters.status || "", // active/inactive
        discount_type: filters.discountType || "", // percentage/fixed
        min_order_total: filters.minValue || "", // Lọc theo giá trị đơn hàng tối thiểu
        max_order_total: filters.maxValue || "", // Lọc theo giá trị đơn hàng tối đa
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lọc coupon:", error);
    return { coupons: [], totalCoupons: 0, totalPages: 1 };
  }
};
// Tạo coupon mới
export const createCoupon = async (data) => {
  try {
    const url = `${API_BASE_URL}/coupons/add`; // Đảm bảo API_BASE_URL đúng với cấu trúc của bạn

    const response = await axios.post(url, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo coupon:", error.response?.data || error.message);
    throw error; // Ném lỗi để xử lý ngoài component gọi API này
  }
};

export const updateCoupon = async (id, data) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/coupons/update/${id}`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating coupon with id ${id}:`, error);
    throw new Error(error.response?.data?.message || error.message);
  }
};
export const updateCouponStatus = async (couponId, newStatus) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/coupons/update-status/${couponId}`,
      {
        method: "PATCH", // Chuyển từ PUT sang PATCH
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      }
    );

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

// API xóa dm
export const deleteCoupon = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/coupons/delete/${id}`);
    return response.data; // Trả về dữ liệu từ server
  } catch (error) {
    console.error("Lỗi khi xóa danh mục :", error);
    throw new Error("❌ Lỗi khi xóa danh mục ");
  }
};
