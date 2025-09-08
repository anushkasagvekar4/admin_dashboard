import knex from "knex";
import config from "./knexfile";

const db = knex(config.development);

db.raw("SELECT 1")
  .then(() => console.log("Database connected!"))
  .catch((err) => console.error("DB connection error:", err))
  .finally(() => db.destroy());
