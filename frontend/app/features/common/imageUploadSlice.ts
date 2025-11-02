// features/common/imageUploadSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { uploadMultipleImagesToCloudinary } from "./imageUploadApi";

interface UploadState {
  urls: string[]; // ✅ store multiple image URLs
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: UploadState = {
  urls: [],
  status: "idle",
  error: null,
};

// ✅ Updated thunk to handle multiple files
export const uploadImages = createAsyncThunk(
  "images/uploadMultiple",
  async (files: File[], { rejectWithValue }) => {
    try {
      const urls = await uploadMultipleImagesToCloudinary(files);
      return urls; // array of URLs
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const imageUploadSlice = createSlice({
  name: "imageUpload",
  initialState,
  reducers: {
    resetImages: (state) => {
      state.urls = [];
      state.status = "idle";
      state.error = null;
    },
    removeImage: (state, action) => {
      // optional: remove single image from preview
      state.urls = state.urls.filter((_, idx) => idx !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadImages.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(uploadImages.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.urls = action.payload; // ✅ store all URLs
      })
      .addCase(uploadImages.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { resetImages, removeImage } = imageUploadSlice.actions;
export default imageUploadSlice.reducer;
