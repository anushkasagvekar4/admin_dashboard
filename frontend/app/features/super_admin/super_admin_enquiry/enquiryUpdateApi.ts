import api from "@/app/utils/axios";

export const fetchEnquiriesAPI = async () => {
  try {
    const response = await api.get("/enquiry/getEnquiries");
    return response.data; // { success, data }
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to fetch enquiries");
  }
};

export const approveEnquiryAPI = async (id: string) => {
  try {
    const response = await api.patch(`/enquiry/approveEnquiry/${id}`);
    return response.data; // { success, message, data }
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to approve enquiry");
  }
};

export const rejectEnquiryAPI = async (id: string, reason?: string) => {
  try {
    const response = await api.patch(`/enquiry/rejectEnquiry/${id}`, {
      reason,
    });
    return response.data; // { success, message }
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to reject enquiry");
  }
};
