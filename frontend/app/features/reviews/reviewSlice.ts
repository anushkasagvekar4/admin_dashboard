import { createSlice } from "@reduxjs/toolkit";
import {
  Review,
  fetchReviewsByCake,
  createReview,
  fetchAllReviews,
} from "./reviewApi";

interface ReviewsState {
  byCakeId: Record<string, Review[]>;
  all: Review[];
  loading: boolean;
  creating: boolean;
  error: string | null;
}

const initialState: ReviewsState = {
  byCakeId: {},
  all: [],
  loading: false,
  creating: false,
  error: null,
};

const reviewsSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    clearReviewsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchReviewsByCake.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchReviewsByCake.fulfilled, (state, action) => {
      state.loading = false;
      const cakeId = action.meta.arg as string;
      state.byCakeId[cakeId] = action.payload;
    });
    builder.addCase(fetchReviewsByCake.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || "Failed to fetch reviews";
    });

    builder.addCase(createReview.pending, (state) => {
      state.creating = true;
      state.error = null;
    });
    builder.addCase(createReview.fulfilled, (state, action) => {
      state.creating = false;
      const review = action.payload;
      if (!state.byCakeId[review.cake_id]) {
        state.byCakeId[review.cake_id] = [];
      }
      state.byCakeId[review.cake_id].unshift(review);
      state.all.unshift(review);
    });
    builder.addCase(createReview.rejected, (state, action) => {
      state.creating = false;
      state.error =
        (action.payload as string) || "Failed to create review";
    });

    builder.addCase(fetchAllReviews.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAllReviews.fulfilled, (state, action) => {
      state.loading = false;
      state.all = action.payload;
    });
    builder.addCase(fetchAllReviews.rejected, (state, action) => {
      state.loading = false;
      state.error =
        (action.payload as string) || "Failed to fetch reviews";
    });
  },
});

export const { clearReviewsError } = reviewsSlice.actions;
export default reviewsSlice.reducer;
