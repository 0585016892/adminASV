import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000, // timeout 5s
  headers: {
    "Content-Type": "application/json",
    // Có thể thêm Authorization nếu cần, ví dụ:
    // Authorization: `Bearer ${token}`,
  },
});

/**
 * Lấy danh sách ngày đã chấm công trong tháng
 * @param {number|string} userId
 * @param {number|string} year - năm, ví dụ 2025
 * @param {number|string} month - tháng, 0-based hoặc 1-based tùy API, giả sử API bạn dùng 1-based (1 = Jan)
 * @returns {Promise<{success:boolean,data?:string[],message?:string}>}
 */
export const getAttendanceByMonth = async (userId, year, month) => {
  try {
    const res = await axiosInstance.get("/attendances/month", {
      params: {
        user_id: userId,
        year,
        month,
      },
    });
    return {
      success: true,
      data: res.data,
      // ví dụ: ["2025-06-01", "2025-06-07", "2025-06-15"]
    };
  } catch (error) {
    console.error(
      "Lỗi khi lấy dữ liệu chấm công theo tháng:",
      error.response?.data || error.message
    );
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Lỗi khi lấy dữ liệu chấm công theo tháng",
    };
  }
};

/**
 * Lấy dữ liệu chấm công trong ngày cho user
 * @param {number|string} user_id
 * @param {string} work_date - định dạng 'YYYY-MM-DD'
 * @returns {Promise<Array|Object>} - dữ liệu chấm công ngày đó (mảng hoặc object tùy API)
 */
export const getAttendanceByDate = async (user_id, work_date) => {
  try {
    const res = await axiosInstance.get("/attendances", {
      params: {
        user_id,
        work_date,
      },
    });
    return {
      success: true,
      data: res.data,
      // ví dụ: ["2025-06-01", "2025-06-07", "2025-06-15"]
    }; // mảng attendances hoặc object
  } catch (error) {
    console.error(
      "Lỗi khi lấy dữ liệu chấm công ngày:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Chấm công vào (check-in)
 * @param {number|string} user_id
 * @param {string} work_date - định dạng 'YYYY-MM-DD'
 * @returns {Promise<{success:boolean,message?:string}>}
 */
export const checkIn = async (user_id, work_date) => {
  try {
    const res = await axiosInstance.post("/attendances/checkin", {
      user_id,
      work_date,
    });
    return res.data; // { success: true } hoặc { success: false, message: "..." }
  } catch (error) {
    console.error(
      "Lỗi khi chấm công vào:",
      error.response?.data || error.message
    );
    return {
      success: false,
      message: error.response?.data?.message || "Lỗi khi chấm công vào",
    };
  }
};

export const checkOut = async (attendanceId) => {
  try {
    const res = await axiosInstance.post("/attendances/checkout", {
      id: attendanceId,
    });
    return {
      success: true,
      data: res.data, // dữ liệu bản ghi vừa cập nhật (có check_out_time)
    };
  } catch (error) {
    console.error(
      "Lỗi khi chấm công ra:",
      error.response?.data || error.message
    );
    return {
      success: false,
      message: error.response?.data?.message || "Chấm công ra thất bại",
    };
  }
};
