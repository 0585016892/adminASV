import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL; 
const productApi = {
  // ----------------- REVIEWS -----------------

  // Lấy danh sách đánh giá theo sản phẩm
  getAllReviews: async (filters = {}) => {
  try {
    const {
      productId = "",
      rating,
      hasImage = false,
      hasVideo = false,
      page = 1,
      limit = 10,
    } = filters;

    const params = {
      ...(productId && { productId }),
      ...(rating && { rating }),
      ...(hasImage ? { hasImage: "true" } : {}),
      ...(hasVideo ? { hasVideo: "true" } : {}),
      page,
      limit,
    };

    const res = await axios.get(`${API_URL}/reviews`, { params });
    return res.data; // data có sẵn: { data: [...], pagination: {...} }
    
  } catch (err) {
    console.error("Lỗi getAllReviews:", err);
    throw err;
  }
  },




  // Upload ảnh đánh giá (trả về danh sách file path string)
  uploadReviewImages: async (files) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("images", files[i]);
    }
    const res = await axios.post(`${API_URL}/reviews/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.files; // => array of string
  },

  // Gửi đánh giá (có thể kèm ảnh/video/variant)
  createReview: async (data) => {
    const payload = {
      product_id: String(data.product_id),
      user_id: String(data.user_id),
      rating: String(data.rating),
      content: data.content || "",
      images: data.images ? JSON.stringify(data.images) : "[]",
      videos: data.videos ? JSON.stringify(data.videos) : "[]",
      variant: data.variant ? String(data.variant) : null,
    };

    const res = await axios.post(`${API_URL}/reviews`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  },

  // Đánh dấu review hữu ích
  likeReview: async (reviewId) => {
    const res = await axios.put(`${API_URL}/reviews/${reviewId}/helpful`);
    return res.data;
  },

  // Shop phản hồi review
  replyReview: async (reviewId, reply_content) => {
    const res = await axios.post(`${API_URL}/reviews/${reviewId}/reply`, {
      reply_content: String(reply_content || ""),
    });
    return res.data;
  },
   // ----------------- ADMIN -----------------

  // Duyệt review (admin)
  approveReview: async (reviewId) => {
    const res = await axios.put(`${API_URL}/reviews/${reviewId}/approve`);
    return res.data;
  },

  // Xóa review (admin)
  deleteReview: async (reviewId) => {
    const res = await axios.delete(`${API_URL}/reviews/${reviewId}`);
    return res.data;
  },
};

export default productApi;
