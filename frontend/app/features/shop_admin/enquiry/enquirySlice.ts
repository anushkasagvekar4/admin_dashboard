// features/shop_admin/enquiry/enquirySlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserEnquiryStatus {
  hasEnquiry: boolean;
  status: "pending" | "approved" | "rejected" | null;
  enquiry: any | null;
}

interface EnquiryState {
  enquiry: any | null;
  loading: boolean;
  checking: boolean;
  error: string | null;
  userEnquiryStatus: UserEnquiryStatus;
}

const initialState: EnquiryState = {
  enquiry: null,
  loading: false,
  checking: false,
  error: null,
  userEnquiryStatus: {
    hasEnquiry: false,
    status: null,
    enquiry: null,
  },
};

const enquirySlice = createSlice({
  name: "enquiry",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setChecking: (state, action: PayloadAction<boolean>) => {
      state.checking = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setEnquiry: (state, action: PayloadAction<any>) => {
      state.enquiry = action.payload;
    },
    setUserEnquiryStatus: (state, action: PayloadAction<UserEnquiryStatus>) => {
      state.userEnquiryStatus = action.payload;
    },
    resetEnquiry: (state) => {
      state.enquiry = null;
      state.error = null;
      state.loading = false;
    },
  },
});

export const {
  setLoading,
  setChecking,
  setError,
  setEnquiry,
  setUserEnquiryStatus,
  resetEnquiry,
} = enquirySlice.actions;

export default enquirySlice.reducer;
