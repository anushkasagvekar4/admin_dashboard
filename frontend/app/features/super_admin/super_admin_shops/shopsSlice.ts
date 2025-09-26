// features/super_admin/super_admin_shops/shopsSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import {
  fetchShops,
  fetchShopById,
  toggleShopStatus,
  Shop,
  Pagination,
} from "./shopsApi";

// ---------- State ----------
interface ShopState {
  shops: Shop[];
  shop: Shop | null;
  pagination: Pagination;
  loading: boolean;
  error: string | null;
}

const initialState: ShopState = {
  shops: [],
  shop: null,
  pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
  loading: false,
  error: null,
};

// ---------- Slice ----------
const shopsSlice = createSlice({
  name: "shops",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchShops
      .addCase(fetchShops.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShops.fulfilled, (state, action) => {
        state.loading = false;
        state.shops = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchShops.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch shops";
      })

      // fetchShopById
      .addCase(fetchShopById.fulfilled, (state, action) => {
        state.shop = action.payload.data;
      })

      // toggleShopStatus
      .addCase(toggleShopStatus.fulfilled, (state, action) => {
        const updatedShop = action.payload; // 👈 already the shop
        state.shops = state.shops.map((shop) =>
          shop.id === updatedShop.id ? updatedShop : shop
        );
      });
  },
});

export default shopsSlice.reducer;
