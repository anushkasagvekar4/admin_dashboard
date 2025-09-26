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

import authReducer from "@/app/features/auth/authSlice";
import enquiryReducer from "@/app/features/shop_admin/enquiry/enquirySlice";
import superAdminReducer from "@/app/features/super_admin/super_admin_enquiry/enquiryUpdateSlice"; // ✅ import
import shopReducer from "@/app/features/super_admin/super_admin_shops/shopsSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  enquiry: enquiryReducer, // ✅ reducer key for shop admin
  superAdmin: superAdminReducer,
  shops: shopReducer, // ✅ reducer key for super admin
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "enquiry"],
  // 👆 keep only auth + enquiry persisted.
  // superAdmin state will reset on refresh (good for lists).
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

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
