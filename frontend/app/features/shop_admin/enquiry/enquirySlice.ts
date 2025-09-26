// features/shopAdmin/enquirySlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createEnquiryAPI } from "./enquiryApi";

interface EnquiryState {
  enquiry: any | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: EnquiryState = {
  enquiry: null,
  status: "idle",
  error: null,
};

// Async thunk for submitting enquiry
export const createEnquiry = createAsyncThunk(
  "enquiry/createEnquiry",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await createEnquiryAPI(data);
      return response.data; // returns newEnquiry
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const enquirySlice = createSlice({
  name: "enquiry",
  initialState,
  reducers: {
    resetEnquiry: (state) => {
      state.enquiry = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createEnquiry.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createEnquiry.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.enquiry = action.payload;
      })
      .addCase(createEnquiry.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { resetEnquiry } = enquirySlice.actions;
export default enquirySlice.reducer;
