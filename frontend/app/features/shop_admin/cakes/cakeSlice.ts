// features/shop_admin/cakes/cakeSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import {
  createCake,
  getCakes,
  getCakeById,
  updateCake,
  deleteCake,
  toggleCakeStatus, // new soft delete / active-inactive toggle
} from "./cakeApi";
interface Cake {
  id: string;
  images: string[]; // ✅ changed from image: string
  cake_name: string;
  price: number;
  cake_type?: string;
  flavour?: string;
  category?: string;
  size?: string;
  noofpeople?: number;
  status: "active" | "inactive";
  created_at?: string;
  updated_at?: string;
}

interface CakeState {
  cakes: Cake[];
  selectedCake: Cake | null;
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
    addPreviewImage: (state, action) => {
      if (state.selectedCake) state.selectedCake.images.push(action.payload);
    },
    removePreviewImage: (state, action) => {
      if (state.selectedCake)
        state.selectedCake.images = state.selectedCake.images.filter(
          (_, i) => i !== action.payload
        );
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
      state.cakes = action.payload;
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
      state.selectedCake = action.payload || null;
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
      const updated = action.payload;
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

    // DELETE (hard delete)
    builder.addCase(deleteCake.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteCake.fulfilled, (state, action) => {
      state.loading = false;
      const deletedId = action.payload; // payload is already the id string
      state.cakes = state.cakes.filter((c) => c.id !== deletedId);
      if (state.selectedCake?.id === deletedId) state.selectedCake = null;
    });

    builder.addCase(deleteCake.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // TOGGLE STATUS (soft delete / activate-deactivate)
    builder.addCase(toggleCakeStatus.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(toggleCakeStatus.fulfilled, (state, action) => {
      state.loading = false;
      const updated = action.payload;
      if (updated) {
        state.cakes = state.cakes.map((c) =>
          c.id === updated.id ? updated : c
        );
        if (state.selectedCake?.id === updated.id) state.selectedCake = updated;
      }
    });
    builder.addCase(toggleCakeStatus.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const {
  clearCakeError,
  clearSelectedCake,
  addPreviewImage,
  removePreviewImage,
  resetCakes,
} = cakeSlice.actions;
export default cakeSlice.reducer;
