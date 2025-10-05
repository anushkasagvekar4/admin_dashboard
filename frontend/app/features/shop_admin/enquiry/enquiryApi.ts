// features/shopAdmin/shopAdminApis.ts
import api from "@/app/utils/axios";

interface EnquiryData {
  shopname: string;
  ownername: string;
  email: string;
  phone: string;
  address: string;
  city: string;
}

export const createEnquiryAPI = async (data: EnquiryData) => {
  try {
    const response = await api.post("/enquiry/createEnquiry", data);
    return response.data; // { success, message, data }
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to create enquiry");
  }
};

// Check current user's enquiry status
export const checkUserEnquiryStatusAPI = async () => {
  try {
    const response = await api.get("/enquiry/checkUserEnquiryStatus");
    return response.data; // { success, data: { hasEnquiry, status, enquiry } }
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to check enquiry status");
  }
};
