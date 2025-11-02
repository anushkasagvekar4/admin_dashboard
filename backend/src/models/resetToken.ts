import knex from "../db/knexInstance";
import { Model } from "objection";

export class ResetToken extends Model {
  id!: string;
  email!: string;
  token!: string;
  expires_at!: string;

  static tableName = "reset_tokens";

  static jsonSchema = {
    type: "object",
    required: ["email", "token", "expires_at"], // ✅ only these are needed
    properties: {
      id: { type: "string", format: "uuid" },
      email: { type: "string", format: "email" },
      token: { type: "string" },
      expires_at: { type: "string", format: "date-time" },
      created_at: { type: ["string", "null"], format: "date-time" },
      updated_at: { type: ["string", "null"], format: "date-time" },
    },
  };
}

// ✅ Bind this model to your Knex instance
ResetToken.knex(knex);
