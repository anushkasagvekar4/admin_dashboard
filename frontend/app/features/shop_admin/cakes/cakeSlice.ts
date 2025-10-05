// features/shop_admin/cakes/cakeSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import {
  createCake,
  getCakes,
  getCakeById,
  updateCake,
  deleteCake,
} from "./cakeApi";

interface CakeState {
  cakes: any[]; // replace `any` with a proper Cake type if you want
  selectedCake: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: CakeState = {
  cakes: [],
  selectedCake: null,
  loading: false,
  error: null,
};

const cakeSlice = createSlice({
  name: "cakes",
  initialState,
  reducers: {
    clearCakeError: (state) => {
      state.error = null;
    },
    clearSelectedCake: (state) => {
      state.selectedCake = null;
    },
    resetCakes: (state) => {
      state.cakes = [];
      state.selectedCake = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // CREATE
    builder.addCase(createCake.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createCake.fulfilled, (state, action) => {
      state.loading = false;
      // backend expected to return { success, message, data }
      if (action.payload?.data) state.cakes.push(action.payload.data);
    });
    builder.addCase(createCake.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // GET ALL
    builder.addCase(getCakes.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getCakes.fulfilled, (state, action) => {
      state.loading = false;
      state.cakes = action.payload; // payload is already BackendCake[]
    });

    builder.addCase(getCakes.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // GET BY ID
    builder.addCase(getCakeById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getCakeById.fulfilled, (state, action) => {
      state.loading = false;
      state.selectedCake = action.payload || null; // use payload directly
    });

    builder.addCase(getCakeById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // UPDATE
    builder.addCase(updateCake.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateCake.fulfilled, (state, action) => {
      state.loading = false;
      const updated = action.payload; // payload is the updated cake object
      if (updated) {
        state.cakes = state.cakes.map((c) =>
          c.id === updated.id ? updated : c
        );
        if (state.selectedCake?.id === updated.id) state.selectedCake = updated;
      }
    });

    builder.addCase(updateCake.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // DELETE
    builder.addCase(deleteCake.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteCake.fulfilled, (state, action) => {
      state.loading = false;
      const deletedId = action.payload as string; // deleted cake id from payload
      state.cakes = state.cakes.filter((c) => c.id !== deletedId);
      if (state.selectedCake?.id === deletedId) state.selectedCake = null;
    });

    builder.addCase(deleteCake.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearCakeError, clearSelectedCake, resetCakes } =
  cakeSlice.actions;
export default cakeSlice.reducer;
