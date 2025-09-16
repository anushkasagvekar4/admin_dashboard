import { knex, Knex } from "knex";
import config from "./knexfile";
import { Model } from "objection";

// Choose env config (development, production, etc.)
const db: Knex = knex(config.development);

// Bind Objection models to knex
Model.knex(db);

export default db;
