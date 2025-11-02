import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  createEnquiryAPI,
  checkUserEnquiryStatusAPI,
  getEnquiriesAPI,
  approveEnquiryAPI,
  rejectEnquiryAPI,
  EnquiryData,
} from "@/app/api/enquiryApi";
/**
 * ============================
 * TYPES
 * ============================
 */
export interface Enquiry {
  id: string;
  shopname: string;
  ownername: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  status: "pending" | "approved" | "rejected";
  reason?: string;
}

interface EnquiryState {
  enquiries: Enquiry[];
  userEnquiry: Enquiry | null;
  hasEnquiry: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

/**
 * ============================
 * INITIAL STATE
 * ============================
 */
const initialState: EnquiryState = {
  enquiries: [],
  userEnquiry: null,
  hasEnquiry: false,
  status: "idle",
  error: null,
};

/**
 * ============================
 * ASYNC THUNKS
 * ============================
 */

// 🟢 Create a new shop enquiry
export const createEnquiry = createAsyncThunk(
  "enquiry/create",
  async (data: EnquiryData, { rejectWithValue }) => {
    try {
      const res = await createEnquiryAPI(data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// 🟢 Check current user's enquiry status
export const checkUserEnquiryStatus = createAsyncThunk(
  "enquiry/checkStatus",
  async (_, { rejectWithValue }) => {
    try {
      const res = await checkUserEnquiryStatusAPI();
      return res.data; // { hasEnquiry, status, enquiry }
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// 🟢 Fetch all enquiries (for Super Admin)
export const fetchAllEnquiries = createAsyncThunk(
  "enquiry/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getEnquiriesAPI();
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// 🟢 Approve an enquiry
export const approveEnquiry = createAsyncThunk(
  "enquiry/approve",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await approveEnquiryAPI(id);
      return { id, data: res.data };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// 🟢 Reject an enquiry
export const rejectEnquiry = createAsyncThunk(
  "enquiry/reject",
  async (
    { id, reason }: { id: string; reason?: string },
    { rejectWithValue }
  ) => {
    try {
      await rejectEnquiryAPI(id, reason);
      return { id, reason };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

/**
 * ============================
 * SLICE
 * ============================
 */
const enquirySlice = createSlice({
  name: "enquiry",
  initialState,
  reducers: {
    resetEnquiryState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // 🔄 Create enquiry
      .addCase(createEnquiry.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createEnquiry.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.userEnquiry = action.payload;
        state.hasEnquiry = true;
      })
      .addCase(createEnquiry.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // 🔄 Check enquiry status
      .addCase(checkUserEnquiryStatus.pending, (state) => {
        state.status = "loading";
      })
      .addCase(checkUserEnquiryStatus.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.hasEnquiry = action.payload.hasEnquiry;
        state.userEnquiry = action.payload.enquiry || null;
      })
      .addCase(checkUserEnquiryStatus.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // 🔄 Fetch all enquiries (super admin)
      .addCase(fetchAllEnquiries.fulfilled, (state, action) => {
        state.enquiries = action.payload;
      })

      // 🔄 Approve
      .addCase(approveEnquiry.fulfilled, (state, action) => {
        const enquiry = state.enquiries.find((e) => e.id === action.payload.id);
        if (enquiry) enquiry.status = "approved";
      })

      // 🔄 Reject
      .addCase(rejectEnquiry.fulfilled, (state, action) => {
        const enquiry = state.enquiries.find((e) => e.id === action.payload.id);
        if (enquiry) {
          enquiry.status = "rejected";
          enquiry.reason = action.payload.reason;
        }
      });
  },
});

export const { resetEnquiryState } = enquirySlice.actions;
export default enquirySlice.reducer;
