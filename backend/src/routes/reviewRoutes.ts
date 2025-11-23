import { Router } from "express";
import ensureAuthenticated from "../middleware/Auth";
import {
  createReview,
  getReviewsByCake,
  getAllReviews,
} from "../controller/reviewController";

const reviewRouter = Router();

// Customer creates a review
reviewRouter.post("/createReview", ensureAuthenticated, createReview);

// Public: list reviews for a cake
reviewRouter.get("/getReviewsByCake/:cakeId", getReviewsByCake);

// Admin / super_admin: list all reviews
reviewRouter.get("/getAllReviews", ensureAuthenticated, getAllReviews);

export default reviewRouter;
