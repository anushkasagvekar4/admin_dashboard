import knex from "../db/knexInstance";
import { Model } from "objection";

export class Auth extends Model {
  id!: string;
  email!: string;
  password!: string;
  role!: "customer" | "shop_admin" | "super_admin"; // enum
  created_at!: Date;
  updated_at!: Date;

  static tableName = "auth";

  static jsonSchema = {
    type: "object",
    required: ["email", "password", "role"],
    properties: {
      id: { type: "string", format: "uuid" },
      email: { type: "string", format: "email" },
      password: { type: "string" },
      role: {
        type: "string",
        enum: ["customer", "shop_admin", "super_admin"],
      },
      created_at: { type: "string", format: "date-time" },
      updated_at: { type: "string", format: "date-time" },
    },
  };
}
// ✅ Bind this model to the Knex instance
Auth.knex(knex);
