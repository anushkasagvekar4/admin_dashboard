import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/app/utils/axios";

export interface Review {
  id: string;
  cake_id: string;
  customer_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
  customer?: {
    id: string;
    full_name: string;
    email: string;
  };
  cake?: {
    id: string;
    cake_name: string;
  };
}

export const fetchReviewsByCake = createAsyncThunk<
  Review[],
  string,
  { rejectValue: string }
>("reviews/fetchByCake", async (cakeId, { rejectWithValue }) => {
  try {
    const res = await api.get(`/reviews/getReviewsByCake/${cakeId}`);
    return res.data.data || res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch reviews"
    );
  }
});

export const createReview = createAsyncThunk<
  Review,
  { cakeId: string; rating: number; comment?: string },
  { rejectValue: string }
>("reviews/create", async ({ cakeId, rating, comment }, { rejectWithValue }) => {
  try {
    const res = await api.post("/reviews/createReview", {
      cake_id: cakeId,
      rating,
      comment,
    });
    return res.data.data || res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to create review"
    );
  }
});

export const fetchAllReviews = createAsyncThunk<
  Review[],
  void,
  { rejectValue: string }
>("reviews/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/reviews/getAllReviews");
    return res.data.data || res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch reviews"
    );
  }
});
