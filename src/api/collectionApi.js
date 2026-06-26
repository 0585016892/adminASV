import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// Thêm bộ sưu tập
export const createCollection = async (formData) => {
  const data = new FormData();

  // 1. Đưa dữ liệu TEXT vào trước
  data.append("name", formData.name || "");
  data.append("slug", formData.slug || "");
  data.append("description", formData.description || "");
  data.append("status", formData.status || "active");

  // 2. Đưa dữ liệu FILE ảnh vào (Bỏ check instanceof File)
  if (formData.image) {
    data.append("image", formData.image);
  }

  const res = await axios.post(`${API_URL}/collections`, data, {
    headers: { "Content-Type": "multipart/form-data" }, // Bắt buộc để trình duyệt hiểu
  });
  console.log(res);

  return res.data;
};

// Cập nhật bộ sưu tập
export const updateCollection = async (id, formData) => {
  const data = new FormData();
  data.append("name", formData.name || "");
  data.append("slug", formData.slug || "");
  data.append("description", formData.description || "");
  data.append("status", formData.status || "active");

  if (formData.image) {
    data.append("image", formData.image);
  }

  const res = await axios.put(`${API_URL}/collections/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};

// Xoá bộ sưu tập
export const deleteCollection = async (id) => {
  const res = await axios.delete(`${API_URL}/collections/delete/${id}`);
  return res.data;
};

// Lấy danh sách bộ sưu tập (có lọc, phân trang)
export const getCollections = async ({
  search = "",
  status = "",
  page = 1,
  limit = 6,
}) => {
  const res = await axios.get(`${API_URL}/collections`, {
    params: { search, status, page, limit },
  });
  return res.data;
};
