import { Request, Response } from "express";
import knex from "../db/knexInstance";

// Create user
export const createUser = async (req: Request, res: Response) => {
  try {
    const { full_name, email, address, phone } = req.body;

    if (!full_name || !email || !address || !phone) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const result = await knex.raw(
      `INSERT INTO "users" (full_name, email, phone, address)
       VALUES (?, ?, ?, ?)
       RETURNING *`,
      [full_name, email, phone, address]
    );

    const newUser = result.rows[0];

    res.status(201).json({
      success: true,
      message: "User added successfully",
      data: newUser.rows,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
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
    const offset = (pageNumber - 1) * pageSize;

    // 2 *10
    // Build WHERE clause for search

    const searchStr = search.toString().trim();
    let whereClause = "";
    if (searchStr) {
      whereClause = `WHERE full_name ILIKE '%${searchStr}%' 
                     OR email ILIKE '%${searchStr}%' 
                     OR phone ILIKE '%${searchStr}%'`;
    }

    // Total count for pagination
    const totalResult = await knex.raw(
      `SELECT COUNT(*) AS total FROM users ${whereClause}`
    );
    const total = parseInt(totalResult.rows[0].total, 10);

    // Fetch users with pagination & sorting
    const usersResult = await knex.raw(
      `SELECT * FROM users 
       ${whereClause} 
       ORDER BY ${sortBy} ${order} 
       LIMIT ? OFFSET ?`,
      [pageSize, offset]
    );

    res.status(200).json({
      success: true,
      message: "users fetched successfully",
      data: usersResult,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
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

    const result = await knex.raw(
      `UPDATE users SET status = ?, updated_at = NOW() WHERE id = ?`,
      [status, id]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: `User ${status === "active" ? "activated" : "deactivated"}`,
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
