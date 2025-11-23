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

// -------------------- EMAIL VERIFICATION --------------------
export const sendEmailVerificationAPI = async (email: string) => {
  try {
    const res = await api.post("/auth/send-verification", { email });
    return res.data;
  } catch (err: any) {
    console.error("❌ Send Verification Error:", err);
    throw new Error(
      err.response?.data?.message || "Failed to send verification email."
    );
  }
};

export const verifyEmailAPI = async (token: string) => {
  try {
    const res = await api.get(`/auth/verify-email?token=${token}`);
    return res.data;
  } catch (err: any) {
    console.error("❌ Verify Email Error:", err);
    throw new Error(
      err.response?.data?.message || "Failed to verify email."
    );
  }
};
