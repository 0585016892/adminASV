import axios from "axios";
const API_BASE = process.env.REACT_APP_API_URL;


export const getProducts = async (search) => {
  const res = await axios.get(`${API_BASE}/products/search?keyword=${search}`);
  return res.data;
};
export const getCoupons = async () => {
    const res = await axios.get(`${API_BASE}/coupons`);
  return res.data;
};

export const createOrder = async (orderData) => {
  const res = await axios.post(`${API_BASE}/orders`, orderData);
  return res.data;
};
export const getCustomers = async () => {
  const res = await axios.get(`${API_BASE}/customers`);
  return res.data;
};