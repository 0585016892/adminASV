import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL + "/posts"; // Ví dụ: http://localhost:5000/api/posts

// Lấy tất cả bài viết có filter
export const filterPosts = async (filters) => {
    const params = new URLSearchParams(filters).toString();
    const res = await axios.get(`${API_BASE_URL}?${params}`);
    return res.data;
  };
// Xóa bài viết
export const deletePost = async (id) => {
  const res = await axios.delete(`${API_BASE_URL}/${id}`);
  return res.data;
};

// Lấy chi tiết bài viết
export const getPostById = async (id) => {
  const res = await axios.get(`${API_BASE_URL}/${id}`);
  return res.data;
};

// Thêm bài viết
export const createPost = async (formData) => {
  const res = await axios.post(API_BASE_URL, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Cập nhật bài viết
export const updatePost = async (id, formData) => {
  const res = await axios.put(`${API_BASE_URL}/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};
export const updatePostStatus = async (id, status) => {
    const res = await axios.patch(`${API_BASE_URL}/${id}/status`, { status });
    return res.data;
  };