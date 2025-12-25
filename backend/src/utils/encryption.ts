
import CryptoJS from "crypto-js";
import dotenv from "dotenv";

dotenv.config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "default_secret_key_please_change";

export const encryptResponse = (data: any): string => {
  try {
    const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
    return ciphertext;
  } catch (error) {
    console.error("Encryption error:", error);
    return JSON.stringify(data); // Fallback to raw data if encryption fails (optional, or throw error)
  }
};
