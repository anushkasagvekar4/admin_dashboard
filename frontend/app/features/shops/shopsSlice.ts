// features/shops/shopsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchActiveShops,
  fetchShopWithCakes,
  fetchCakesByShop,
  Shop,
  ShopWithCakes,
  Cake,
  FetchShopsResponse,
  Pagination,
} from "./shopsApi";

interface ShopsState {
  shops: Shop[];
  currentShop: ShopWithCakes | null;
  shopCakes: Cake[];
  loading: boolean;
  error: string | null;
  pagination: Pagination | null;
}

const initialState: ShopsState = {
  shops: [],
  currentShop: null,
  shopCakes: [],
  loading: false,
  error: null,
  pagination: null,
};

const shopsSlice = createSlice({
  name: "shops",
  initialState,
  reducers: {
    clearCurrentShop: (state) => {
      state.currentShop = null;
      state.shopCakes = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch active shops
    builder
      .addCase(fetchActiveShops.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveShops.fulfilled, (state, action: PayloadAction<FetchShopsResponse>) => {
        state.loading = false;
        state.shops = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchActiveShops.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch shop with cakes
    builder
      .addCase(fetchShopWithCakes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShopWithCakes.fulfilled, (state, action: PayloadAction<ShopWithCakes>) => {
        state.loading = false;
        state.currentShop = action.payload;
        state.shopCakes = action.payload.cakes;
      })
      .addCase(fetchShopWithCakes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch cakes by shop
    builder
      .addCase(fetchCakesByShop.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCakesByShop.fulfilled, (state, action: PayloadAction<Cake[]>) => {
        state.loading = false;
        state.shopCakes = action.payload;
      })
      .addCase(fetchCakesByShop.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentShop, clearError } = shopsSlice.actions;
export default shopsSlice.reducer;
