// import api from "@/app/utils/axios";

import api from "../utils/axios";

// -------------------- FORGOT PASSWORD --------------------
export const forgotPasswordAPI = async (email: string) => {
  try {
    const res = await api.post("/auth/forgotPassword", { email });
    return res.data;
  } catch (err: any) {
    console.error("❌ Forgot Password Error:", err);
    throw new Error(
      err.response?.data?.message || "Failed to send reset link."
    );
  }
};

// -------------------- RESET PASSWORD --------------------
export const resetPasswordAPI = async (
  email: string,
  token: string,
  newPassword: string
) => {
  try {
    const res = await api.post("/auth/resetPassword", {
      email,
      token,
      newPassword,
    });
    return res.data;
  } catch (err: any) {
    console.error("❌ Reset Password Error:", err);
    throw new Error(err.response?.data?.message || "Failed to reset password.");
  }
};
