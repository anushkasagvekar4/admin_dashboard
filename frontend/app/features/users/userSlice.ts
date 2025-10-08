import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  getMyCustomer,
  updateCustomer,
  updateCustomerStatus,
  updateMyCustomer,
} from "./userApi";

// Backend Customer interface
export interface BackendCustomer {
  id: string;
  full_name: string;
  email: string;
  address: string;
  phone: string;
  status: "active" | "inactive";
  created_at?: string;
  updated_at?: string;
}

// Slice state interface
interface CustomerState {
  customers: BackendCustomer[];
  selectedCustomer: BackendCustomer | null;
  loading: boolean;
  error: string | null;
}

const initialState: CustomerState = {
  customers: [],
  selectedCustomer: null,
  loading: false,
  error: null,
};

const customerSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    clearCustomerError: (state) => {
      state.error = null;
    },
    clearSelectedCustomer: (state) => {
      state.selectedCustomer = null;
    },
    resetCustomers: (state) => {
      state.customers = [];
      state.selectedCustomer = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // 🧩 CREATE
    builder.addCase(createCustomer.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      createCustomer.fulfilled,
      (state, action: PayloadAction<BackendCustomer>) => {
        state.loading = false;
        if (action.payload) state.customers.push(action.payload);
      }
    );
    builder.addCase(
      createCustomer.rejected,
      (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload || "Create customer failed";
      }
    );

    // 🧩 GET ALL
    builder.addCase(getAllCustomers.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      getAllCustomers.fulfilled,
      (state, action: PayloadAction<BackendCustomer[]>) => {
        state.loading = false;
        state.customers = action.payload;
      }
    );
    builder.addCase(
      getAllCustomers.rejected,
      (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload || "Fetching customers failed";
      }
    );

    // 🧩 GET BY ID
    builder.addCase(getCustomerById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      getCustomerById.fulfilled,
      (state, action: PayloadAction<BackendCustomer>) => {
        state.loading = false;
        state.selectedCustomer = action.payload || null;
      }
    );
    builder.addCase(
      getCustomerById.rejected,
      (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload || "Fetching customer failed";
      }
    );

    // 🧩 UPDATE
    builder.addCase(updateCustomer.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      updateCustomer.fulfilled,
      (state, action: PayloadAction<BackendCustomer>) => {
        state.loading = false;
        const updated = action.payload;
        if (updated) {
          state.customers = state.customers.map((c) =>
            c.id === updated.id ? updated : c
          );
          if (state.selectedCustomer?.id === updated.id)
            state.selectedCustomer = updated;
        }
      }
    );
    builder.addCase(
      updateCustomer.rejected,
      (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload || "Update customer failed";
      }
    );

    // 🧩 TOGGLE STATUS
    builder.addCase(updateCustomerStatus.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      updateCustomerStatus.fulfilled,
      (state, action: PayloadAction<BackendCustomer>) => {
        state.loading = false;
        const updated = action.payload;
        if (updated) {
          state.customers = state.customers.map((c) =>
            c.id === updated.id ? updated : c
          );
          if (state.selectedCustomer?.id === updated.id)
            state.selectedCustomer = updated;
        }
      }
    );
    builder.addCase(
      updateCustomerStatus.rejected,
      (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload || "Status update failed";
      }
    );

    // 🧩 GET MY PROFILE
    builder.addCase(getMyCustomer.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      getMyCustomer.fulfilled,
      (state, action: PayloadAction<BackendCustomer>) => {
        state.loading = false;
        state.selectedCustomer = action.payload;
      }
    );
    builder.addCase(
      getMyCustomer.rejected,
      (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch my profile";
      }
    );

    // 🧩 UPDATE MY PROFILE
    builder.addCase(updateMyCustomer.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      updateMyCustomer.fulfilled,
      (state, action: PayloadAction<BackendCustomer>) => {
        state.loading = false;
        const updated = action.payload;
        if (updated) {
          state.selectedCustomer = updated;
          // Optional: update in global list if it exists
          state.customers = state.customers.map((c) =>
            c.id === updated.id ? updated : c
          );
        }
      }
    );
    builder.addCase(
      updateMyCustomer.rejected,
      (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload || "Failed to update my profile";
      }
    );
  },
});

export const { clearCustomerError, clearSelectedCustomer, resetCustomers } =
  customerSlice.actions;

export default customerSlice.reducer;
