import { createSlice } from "@reduxjs/toolkit";
import { logoutUser, signinUser } from "./authApi";

interface AuthState {
  user: any | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  token: string;
}

const initialState: AuthState = {
  user: null,
  isAdmin: false,
  loading: false,
  error: null,
  token: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(signinUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signinUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAdmin = action.payload.isAdmin;
      })
      .addCase(signinUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || "Signin failed";
      });
    builder.addCase(logoutUser.fulfilled, (state, action) => {
      state.user = null;
      state.isAdmin = false;
      state.error = null;
      state.token = "";
    });
  },
});

// export const {  } = authSlice.actions;
export default authSlice.reducer;
