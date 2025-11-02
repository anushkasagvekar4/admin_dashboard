"use client";
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

import imageUploadReducer from "@/app/features/common/imageUploadSlice";
import authReducer from "@/app/features/auth/authSlice";
import enquiryReducer from "@/app/features/shop_admin/enquiry/enquirySlice";
import superAdminReducer from "@/app/features/super_admin/super_admin_enquiry/enquiryUpdateSlice";
import shopReducer from "@/app/features/super_admin/super_admin_shops/shopsSlice";
import cakeReducer from "@/app/features/shop_admin/cakes/cakeSlice";
import customerReducer from "@/app/features/users/userSlice";
import orderReducer from "@/app/features/orders/orderSlice";
import cartReducer from "@/app/features/orders/cartSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  enquiry: enquiryReducer,
  superAdmin: superAdminReducer,
  shops: shopReducer,
  imageUpload: imageUploadReducer,
  cakes: cakeReducer,
  customers: customerReducer,
  orders: orderReducer,
  cart: cartReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // ✅ persist only auth
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

// ✅ Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
