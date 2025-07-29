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
