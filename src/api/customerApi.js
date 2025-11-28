import axios from "axios";
const API_BASE_URL = process.env.REACT_APP_API_URL;

export const getCustomers = async () => {
  const response = await axios.get(`${API_BASE_URL}/customers`);
  return response.data;
};
export const filterKhachhang = async (filters) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/customers`, {
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
    return { customers: [], totalKhachhang: 0, totalPages: 1 };
  }
};
// API xóa
export const deleteKhachhang = async (id,userID) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/customers/delete/${id}`,
      {
        data: { userID }, // <== BODY ĐỂ GHI LOG
      }
    );
    return response.data; // Trả về dữ liệu từ server
  } catch (error) {
    console.error("Lỗi khi xóa danh mục :", error);
    throw new Error("❌ Lỗi khi xóa danh mục ");
  }
};
// Cập nhật trạng thái khách hàng
export const updateCustomerStatus = async (id, status, userID) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/customers/update_status/${id}`,
      {
        status,
        userID
      }
    );
    return response.data; // Trả về dữ liệu phản hồi từ API nếu cần
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái:", error);
    throw error; // Ném lỗi để component có thể xử lý
  }
};
// Hàm lấy chi tiết khách hàng và các đơn hàng
export const getCustomerDetails = async (id) => {
  try {
    // Gửi yêu cầu GET tới API
    const response = await axios.get(`${API_BASE_URL}/customers/details/${id}`);

    // Kiểm tra và trả về dữ liệu từ server
    console.log(response.data);
    return response.data;
  } catch (error) {
    // Xử lý lỗi nếu có
    console.error("Lỗi khi lấy thông tin khách hàng:", error);
    throw error; // Bạn có thể ném lại lỗi để xử lý ở các nơi gọi hàm này
  }
};
