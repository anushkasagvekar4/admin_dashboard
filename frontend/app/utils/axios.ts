import axios from "axios";
import { store } from "@/app/store/Store"; // import your redux store

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔑 Attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token; // from redux
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
