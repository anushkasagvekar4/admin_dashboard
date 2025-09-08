import axios from "axios";

// Make sure you have NEXT_PUBLIC_ prefix if using in Next.js frontend
const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`, // 👈 add /api after your env variable
  withCredentials: true, // 👈 send/receive cookies automatically
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
