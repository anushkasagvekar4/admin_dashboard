import { Request, Response } from "express";
import { AuthRequest } from "../middleware/Auth";
import { Review } from "../models/review";
import { Customer } from "../models/customer";

// Create a new review (customer only)
export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Only customers can create reviews",
      });
    }

    const { cake_id, rating, comment } = req.body;

    if (!cake_id || typeof rating !== "number") {
      return res.status(400).json({
        success: false,
        message: "cake_id and numeric rating are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Find the customer profile for the logged-in auth user
    const customer = await Customer.query()
      .where("auth_id", req.user.id)
      .first();

    if (!customer) {
      return res.status(400).json({
        success: false,
        message: "Customer profile not found. Please complete your profile first.",
      });
    }

    const review = await Review.query().insertAndFetch({
      cake_id,
      customer_id: customer.id,
      rating,
      comment,
    });

    return res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: review,
    });
  } catch (err: any) {
    console.error("Create review error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Something went wrong while creating review",
    });
  }
};

// Get reviews for a specific cake (public)
export const getReviewsByCake = async (req: Request, res: Response) => {
  try {
    const { cakeId } = req.params;

    const reviews = await Review.query()
      .where("cake_id", cakeId)
      .withGraphFetched("customer")
      .orderBy("created_at", "desc");

    return res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (err: any) {
    console.error("Get reviews by cake error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch reviews",
    });
  }
};

// Get all reviews (admin / super_admin)
export const getAllReviews = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || (req.user.role !== "shop_admin" && req.user.role !== "super_admin")) {
      return res.status(403).json({
        success: false,
        message: "Only admins can view all reviews",
      });
    }

    const { role, id: userId } = req.user!;

    let query = Review.query()
      .withGraphFetched("[customer, cake]")
      .orderBy("created_at", "desc");

    // Filter reviews based on user role
    if (role === "shop_admin") {
      // Shop admins can only see reviews for their own cakes
      query = query.where("cakes.shopId", userId);
    }
    // Super admins can see all reviews (no additional filter needed)

    const reviews = await query;

    return res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (err: any) {
    console.error("Get all reviews error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch reviews",
    });
  }
};
