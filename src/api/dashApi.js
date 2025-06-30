// dashApi.js

const API_BASE = process.env.REACT_APP_API_URL; // đổi theo địa chỉ backend của bạn

export async function fetchStats() {
  try {
    const response = await fetch(`${API_BASE}/dashboard/stats`);
    if (!response.ok) {
      throw new Error("Lỗi khi lấy dữ liệu thống kê");
    }
    const data = await response.json();
    return data; // trả về mảng statsData
  } catch (error) {
    console.error("fetchStats error:", error);
    throw error;
  }
}
export async function fetchRevenueDaily(from_date, to_date) {
  try {
    const url = new URL(API_BASE + "/dashboard/revenue");
    if (from_date) url.searchParams.append("from_date", from_date);
    if (to_date) url.searchParams.append("to_date", to_date);

    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error("Lỗi khi lấy dữ liệu doanh thu");
    }
    const data = await res.json();

    // Chuyển đổi dữ liệu nếu cần (ví dụ map lại key hoặc format)
    // Ở đây data là [{date: "2023-05-01", revenue: 100000}, ...]
    return data.map((item) => ({
      date: item.date,
      revenue: item.revenue,
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}
// Hàm gọi API lấy đơn hàng mới nhất
export async function fetchRecentOrders() {
  try {
    const response = await fetch(`${API_BASE}/dashboard/orders`);
    if (!response.ok) {
      throw new Error("Lỗi khi lấy đơn hàng mới nhất");
    }
    const data = await response.json();
    // Giả sử API trả về data ở dạng { data: [...] }
    return data.data || [];
  } catch (error) {
    console.error("fetchRecentOrders error:", error);
    return [];
  }
}
