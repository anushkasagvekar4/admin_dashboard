import axios from "@/app/utils/axios";

export const fetchSuperAdminDashboard = async () => {
  const response = await axios.get("/super-admin/dashboard");
  return response.data;
};
