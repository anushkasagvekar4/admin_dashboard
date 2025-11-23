// features/super_admin/website_settings/websiteSettingsSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchWebsiteSettings,
  fetchWebsiteSettingsAdmin,
  updateWebsiteSettings,
  toggleMaintenanceMode,
  WebsiteSettings,
} from "./websiteSettingsApi";

interface WebsiteSettingsState {
  settings: WebsiteSettings | null;
  loading: boolean;
  error: string | null;
  isMaintenanceMode: boolean;
}

const initialState: WebsiteSettingsState = {
  settings: null,
  loading: false,
  error: null,
  isMaintenanceMode: false,
};

const websiteSettingsSlice = createSlice({
  name: "websiteSettings",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setMaintenanceMode: (state, action: PayloadAction<boolean>) => {
      state.isMaintenanceMode = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch website settings (public)
    builder
      .addCase(fetchWebsiteSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWebsiteSettings.fulfilled, (state, action: PayloadAction<WebsiteSettings>) => {
        state.loading = false;
        state.settings = action.payload;
        state.isMaintenanceMode = action.payload.maintenance_mode;
      })
      .addCase(fetchWebsiteSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch website settings (admin)
    builder
      .addCase(fetchWebsiteSettingsAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWebsiteSettingsAdmin.fulfilled, (state, action: PayloadAction<WebsiteSettings>) => {
        state.loading = false;
        state.settings = action.payload;
        state.isMaintenanceMode = action.payload.maintenance_mode;
      })
      .addCase(fetchWebsiteSettingsAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update website settings
    builder
      .addCase(updateWebsiteSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWebsiteSettings.fulfilled, (state, action: PayloadAction<WebsiteSettings>) => {
        state.loading = false;
        state.settings = action.payload;
        state.isMaintenanceMode = action.payload.maintenance_mode;
      })
      .addCase(updateWebsiteSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Toggle maintenance mode
    builder
      .addCase(toggleMaintenanceMode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleMaintenanceMode.fulfilled, (state, action: PayloadAction<WebsiteSettings>) => {
        state.loading = false;
        state.settings = action.payload;
        state.isMaintenanceMode = action.payload.maintenance_mode;
      })
      .addCase(toggleMaintenanceMode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setMaintenanceMode } = websiteSettingsSlice.actions;
export default websiteSettingsSlice.reducer;
