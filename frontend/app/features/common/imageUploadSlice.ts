// features/common/imageUploadSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { uploadImageToCloudinary } from "./imageUploadApi";

interface UploadState {
  url: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: UploadState = {
  url: null,
  status: "idle",
  error: null,
};

export const uploadImage = createAsyncThunk(
  "image/upload",
  async (file: File, { rejectWithValue }) => {
    try {
      const url = await uploadImageToCloudinary(file);
      return url;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const imageUploadSlice = createSlice({
  name: "imageUpload",
  initialState,
  reducers: {
    resetImage: (state) => {
      state.url = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadImage.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(uploadImage.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.url = action.payload;
      })
      .addCase(uploadImage.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { resetImage } = imageUploadSlice.actions;
export default imageUploadSlice.reducer;
