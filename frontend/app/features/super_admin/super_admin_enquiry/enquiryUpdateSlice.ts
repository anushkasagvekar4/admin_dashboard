// features/super_admin/superAdminSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  approveEnquiryAPI,
  fetchEnquiriesAPI,
  rejectEnquiryAPI,
} from "./enquiryUpdateApi";

interface Enquiry {
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

interface SuperAdminState {
  enquiries: Enquiry[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: SuperAdminState = {
  enquiries: [],
  status: "idle",
  error: null,
};

// ✅ Thunks
export const fetchEnquiries = createAsyncThunk(
  "superAdmin/fetchEnquiries",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchEnquiriesAPI();
      return data.data; // backend sends { success, data }
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const approveEnquiry = createAsyncThunk(
  "superAdmin/approveEnquiry",
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await approveEnquiryAPI(id);
      return { id, data: data.data };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const rejectEnquiry = createAsyncThunk(
  "superAdmin/rejectEnquiry",
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

// ✅ Slice
const superAdminSlice = createSlice({
  name: "superAdmin",
  initialState,
  reducers: {
    resetSuperAdminState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchEnquiries.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchEnquiries.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.enquiries = action.payload;
      })
      .addCase(fetchEnquiries.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // approve
      .addCase(approveEnquiry.fulfilled, (state, action) => {
        const enquiry = state.enquiries.find((e) => e.id === action.payload.id);
        if (enquiry) enquiry.status = "approved";
      })

      // reject
      .addCase(rejectEnquiry.fulfilled, (state, action) => {
        const enquiry = state.enquiries.find((e) => e.id === action.payload.id);
        if (enquiry) {
          enquiry.status = "rejected";
          enquiry.reason = action.payload.reason;
        }
      });
  },
});

export const { resetSuperAdminState } = superAdminSlice.actions;
export default superAdminSlice.reducer;
