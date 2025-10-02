// features/shopAdmin/enquirySlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createEnquiryAPI, checkUserEnquiryStatusAPI } from "./enquiryApi";

interface EnquiryState {
  enquiry: any | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  userEnquiryStatus: {
    hasEnquiry: boolean;
    status: "pending" | "approved" | "rejected" | null;
    enquiry: any | null;
  };
  checkingStatus: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: EnquiryState = {
  enquiry: null,
  status: "idle",
  error: null,
  userEnquiryStatus: {
    hasEnquiry: false,
    status: null,
    enquiry: null,
  },
  checkingStatus: "idle",
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

// Async thunk for checking user's enquiry status
export const checkUserEnquiryStatus = createAsyncThunk(
  "enquiry/checkUserEnquiryStatus",
  async (_, { rejectWithValue }) => {
    try {
      const response = await checkUserEnquiryStatusAPI();
      return response.data; // returns { hasEnquiry, status, enquiry }
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
    resetUserEnquiryStatus: (state) => {
      state.userEnquiryStatus = {
        hasEnquiry: false,
        status: null,
        enquiry: null,
      };
      state.checkingStatus = "idle";
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
      })
      
      // Check user enquiry status
      .addCase(checkUserEnquiryStatus.pending, (state) => {
        state.checkingStatus = "loading";
        state.error = null;
      })
      .addCase(checkUserEnquiryStatus.fulfilled, (state, action) => {
        state.checkingStatus = "succeeded";
        state.userEnquiryStatus = action.payload;
      })
      .addCase(checkUserEnquiryStatus.rejected, (state, action) => {
        state.checkingStatus = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { resetEnquiry, resetUserEnquiryStatus } = enquirySlice.actions;
export default enquirySlice.reducer;
