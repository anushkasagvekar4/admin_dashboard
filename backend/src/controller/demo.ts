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
      succes: true,
      message: "users fetched successfully",
      data: usersResult.rows,
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
