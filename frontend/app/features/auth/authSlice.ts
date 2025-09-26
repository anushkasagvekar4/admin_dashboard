// app/features/auth/authSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import { signupUser, signinUser, logoutUser } from "./authApi";

interface AuthState {
  user: string | null;
  role: string | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  role: null,
  token: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ---- Signup ----
    builder.addCase(signupUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(signupUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.email;
      state.role = action.payload.role;
      state.token = action.payload.token;
    });
    builder.addCase(signupUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // ---- Signin ----
    builder.addCase(signinUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(signinUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.email;
      state.role = action.payload.role;
      state.token = action.payload.token;
      // setAuthToken(action.payload.token);
    });
    builder.addCase(signinUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // ---- Logout ----
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.role = null;
      state.token = null;
      state.loading = false;
      state.error = null;
      // setAuthToken(null);
    });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
