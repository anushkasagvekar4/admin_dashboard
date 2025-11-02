import knex, { Knex } from "knex";
import { knexSnakeCaseMappers } from "objection";
import * as dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const caPath = path.resolve(__dirname, "../../ca.pem");

// 👇 Log for debug
console.log("Loading Aiven DB connection...");
console.log("Using CA file:", caPath, fs.existsSync(caPath));

const db: Knex = knex({
  client: "pg",
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: true, // <-- force verification using CA
      ca: fs.readFileSync(caPath).toString(), // <-- trust Aiven’s CA
    },
  },
  pool: { min: 0, max: 10 },
  ...knexSnakeCaseMappers(),
});

export default db;
