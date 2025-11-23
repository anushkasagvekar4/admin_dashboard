import knex from "../db/knexInstance";
import { Model } from "objection";

export class Auth extends Model {
  id!: string;
  email!: string;
  password!: string;
  role!: "customer" | "shop_admin" | "super_admin"; // enum
  email_verified!: boolean;
  email_verification_token?: string;
  email_verification_expires?: string;
  created_at!: string;
  updated_at!: string;

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
      email_verified: { type: "boolean", default: false },
      email_verification_token: { type: "string" },
      email_verification_expires: { type: "string", format: "date-time" },
      created_at: { type: "string", format: "date-time" },
      updated_at: { type: "string", format: "date-time" },
    },
  };
}
// ✅ Bind this model to the Knex instance
Auth.knex(knex);
