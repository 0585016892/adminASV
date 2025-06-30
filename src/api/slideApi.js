import axios from "axios";
const API_BASE_URL = process.env.REACT_APP_API_URL;

export const getSlides = async ({ page, limit, keyword }) => {
  const res = await axios.get(`${API_BASE_URL}/slides`, {
    params: { page, limit, keyword },
  });
  return res.data;
};

export const deleteSlideById = async (id) => {
  return await axios.delete(`${API_BASE_URL}/slides/delete/${id}`);
};
// Hàm updateSlide, nhận vào slideId và formData (dữ liệu Slide cần cập nhật)
export const updateSlide = async (slideId, formData) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/slides/update/${slideId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data", // Đảm bảo gửi file (hình ảnh) đúng định dạng
        },
      }
    );
    return response.data; // Trả về dữ liệu phản hồi từ server
  } catch (error) {
    console.error("Lỗi khi cập nhật Slide:", error);
    throw new Error("Cập nhật Slide thất bại");
  }
};
// Hàm getSlideById để lấy dữ liệu của một Slide theo slideId
export const getSlideById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/slides/${id}`);
    return response.data; // Trả về dữ liệu Slide
  } catch (error) {
    console.error("Lỗi khi lấy thông tin Slide:", error);
    throw new Error("Không thể lấy thông tin Slide");
  }
};
export const updateSlideStatus = async (id, newStatus) => {
  try {
    const response = await fetch(`${API_BASE_URL}/slides/status/${id}`, {
      method: "PATCH", // Chuyển từ PUT sang PATCH
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus }),
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
