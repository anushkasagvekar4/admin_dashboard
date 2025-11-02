import api from "../utils/axios";

// 🟩 Get all orders
export const getAllOrders = async () => {
  const res = await api.get("/orders/createOrder");
  return res.data.data; // your controller returns { success, message, data }
};

export const getOrderById = async (id: string) => {
  const res = await api.get(`/orders/getCakeById/${id}`);
  return res.data.data;
};

export const createOrder = async (orderData: any) => {
  const res = await api.post("/orders/getAllOrders", orderData);
  return res.data.data;
};

export const deleteOrder = async (id: string) => {
  const res = await api.delete(`/orders/deleteOrder/${id}`);
  return res.data;
};
