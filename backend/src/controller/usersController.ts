import { User } from "../models/user";
import { Request, Response } from "express";
// import knex from "../db/knexInstance";

// Create user
export const createUser = async (req: Request, res: Response) => {
  try {
    const { full_name, email, address, phone } = req.body;

    if (!full_name || !email || !address || !phone) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const newUser = await User.query().insert({
      full_name,
      email,
      address,
      phone,
    });

    res.status(201).json({
      success: true,
      message: "User added successfully",
      data: newUser,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

//delete user
// export const deleteUser = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;

//     if (!id) {
//       return res
//         .status(400)
//         .json({ success: false, message: "ID is required" });
//     }

//     // Raw SQL for soft delete
//     const result = await knex.raw(
//       `UPDATE users SET status = 'inactive', updated_at = NOW() WHERE id = ?`,
//       [id]
//     );

//     const affectedRows = result.rowCount;

//     if (affectedRows === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });
//     }

//     res.status(200).json({
//       success: true,
//       message: "User deleted",
//     });
//   } catch (error: any) {
//     console.error("Error deleting user:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };

//get user
export const getAllUser = async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      limit = "10",
      search = "",
      sortBy = "created_at",
      order = "desc",
    } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10); // ✅ Correct
    // const offset = (pageNumber - 1) * pageSize;

    // 2 *10
    // Build WHERE clause for search

    // Start query
    let query = User.query();

    // Apply search
    if (search) {
      query = query.where((builder) => {
        builder
          .where("full_name", "ilike", `%${search}%`)
          .orWhere("email", "ilike", `%${search}%`)
          .orWhere("phone", "ilike", `%${search}%`);
      });
    }

    // Apply sorting
    query = query.orderBy(sortBy as string, order as "asc" | "desc");

    // Pagination with Objection's built-in `.page()`
    const result = await query.page(pageNumber - 1, pageSize);

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: result.results, // paginated rows
      pagination: {
        total: result.total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(result.total / pageSize),
      },
    });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    res.status(400).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// update user status
export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "active" or "inactive"

    if (!id || !status) {
      return res
        .status(400)
        .json({ success: false, message: "ID and status are required" });
    }

    if (!["active", "inactive"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const updatedUser = await User.query().patchAndFetchById(id, {
      status,
      updated_at: new Date(),
    });

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: `User ${status === "active" ? "activated" : "deactivated"}`,
      data: updatedUser,
    });
  } catch (error: any) {
    console.error("Error updating user status:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
