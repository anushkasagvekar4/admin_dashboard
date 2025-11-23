// features/super_admin/website_settings/websiteSettingsApi.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/app/utils/axios";

// ---------- Types ----------
export interface WebsiteSettings {
  id: string;
  site_name: string;
  site_description?: string;
  contact_email: string;
  contact_phone?: string;
  contact_address?: string;
  social_facebook?: string;
  social_instagram?: string;
  social_twitter?: string;
  social_linkedin?: string;
  logo_url?: string;
  favicon_url?: string;
  hero_title?: string;
  hero_description?: string;
  hero_bg_image?: string;
  about_us?: string;
  privacy_policy?: string;
  terms_of_service?: string;
  maintenance_mode: boolean;
  maintenance_message?: string;
  created_at?: string;
  updated_at?: string;
}

// ---------- Async Thunks ----------

// Get website settings (public)
export const fetchWebsiteSettings = createAsyncThunk<
  WebsiteSettings,
  void,
  { rejectValue: string }
>("websiteSettings/fetchWebsiteSettings", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/website-settings/public");
    return response.data.data as WebsiteSettings;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch website settings"
    );
  }
});

// Get website settings (admin)
export const fetchWebsiteSettingsAdmin = createAsyncThunk<
  WebsiteSettings,
  void,
  { rejectValue: string }
>("websiteSettings/fetchWebsiteSettingsAdmin", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/website-settings/admin");
    return response.data.data as WebsiteSettings;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch website settings"
    );
  }
});

// Update website settings
export const updateWebsiteSettings = createAsyncThunk<
  WebsiteSettings,
  Partial<WebsiteSettings>,
  { rejectValue: string }
>("websiteSettings/updateWebsiteSettings", async (settings, { rejectWithValue }) => {
  try {
    const response = await api.put("/website-settings/admin", settings);
    return response.data.data as WebsiteSettings;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to update website settings"
    );
  }
});

// Toggle maintenance mode
export const toggleMaintenanceMode = createAsyncThunk<
  WebsiteSettings,
  { maintenance_mode: boolean; maintenance_message?: string },
  { rejectValue: string }
>("websiteSettings/toggleMaintenanceMode", async (maintenanceData, { rejectWithValue }) => {
  try {
    const response = await api.patch("/website-settings/admin/maintenance", maintenanceData);
    return response.data.data as WebsiteSettings;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to toggle maintenance mode"
    );
  }
});
