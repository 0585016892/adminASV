import axios from "axios";
const API_BASE_URL = process.env.REACT_APP_API_URL;
export const markMessagesAsRead = async (senderId, receiverId) => {
  try {
    await axios.post(`${API_BASE_URL}/chat/mark-read`, {
      sender: senderId,
      receiver: receiverId,
    });
  } catch (error) {
    console.error("Không thể đánh dấu tin nhắn đã đọc:", error);
  }
};
export const fetchNotifications = async (userId) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/chat/notifications/${userId}`);
    // trả về mảng notifications
    return res.data.notifications || [];
  } catch (err) {
    console.error("Lỗi fetchNotifications:", err);
    return [];
  }
};
export const markNotificationAsRead = async (noteId, token) => {
  try {
    const res = await fetch(`${API_BASE_URL}/chat/notifications/mark-read`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ noteId }),
    });

    if (!res.ok) {
      throw new Error("Không thể đánh dấu thông báo là đã đọc");
    }

    return await res.json();
  } catch (err) {
    console.error("Lỗi markNotificationAsRead:", err);
    throw err;
  }
};
export const markAllNotificationsAsRead = async (userId) => {
  if (!userId) return { success: false, message: "User ID không hợp lệ" };

  try {
    const { data } = await axios.post(
      `${API_BASE_URL}/dashboard/notifications/mark-read-all`,
      { userId }
    );
    return { success: true, data };
  } catch (error) {
    console.error("Lỗi khi đánh dấu tất cả thông báo đã đọc:", error);
    return { success: false, message: error.message };
  }
};