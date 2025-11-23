import knex, { Knex } from "knex";
import { knexSnakeCaseMappers } from "objection";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// 👇 Log for debug
console.log("Loading Neon DB connection...");

const db: Knex = knex({
  client: "pg",
  connection: {
    connectionString: process.env.DATABASE_URL,
  },
  pool: { min: 0, max: 5 },
  ...knexSnakeCaseMappers(),
});

export default db;
