// features/shop_admin/enquiry/enquiryApi.ts
import api from "@/app/utils/axios";

export interface EnquiryData {
  shopname: string;
  ownername: string;
  email: string;
  phone: string;
  address: string;
  city: string;
}

/**
 * ============================
 * SHOP ADMIN APIs
 * ============================
 */

// 🟢 Create a new shop enquiry
export const createEnquiryAPI = async (data: EnquiryData) => {
  const res = await api.post("/enquiry/createEnquiry", data);
  return res.data; // { success, message, data }
};

// 🟢 Check current user's enquiry status
export const checkUserEnquiryStatusAPI = async () => {
  const res = await api.get("/enquiry/checkUserEnquiryStatus");
  return res.data; // { success, data: { hasEnquiry, status, enquiry } }
};

/**
 * ============================
 * SUPER ADMIN APIs
 * ============================
 */

// 🟢 Get all enquiries (for Super Admin)
export const getEnquiriesAPI = async () => {
  const res = await api.get("/enquiry/getEnquiries");
  return res.data; // { success, data: [...] }
};

// 🟢 Get a single enquiry by ID
export const getEnquiryByIdAPI = async (id: string) => {
  const res = await api.get(`/enquiry/${id}`);
  return res.data; // { success, data }
};

// 🟢 Approve an enquiry (creates shop + sets status)
export const approveEnquiryAPI = async (id: string) => {
  const res = await api.patch(`/enquiry/approveEnquiry/${id}`);
  return res.data; // { success, message, data: newShop }
};

// 🟢 Reject an enquiry
export const rejectEnquiryAPI = async (id: string, reason?: string) => {
  const res = await api.patch(`/enquiry/rejectEnquiry/${id}`, { reason });
  return res.data; // { success, message }
};
