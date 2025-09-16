import { Model } from "objection";
import { format } from "path";
export class Auth extends Model {
  id!: string;
  email!: string;
  password!: string;
  isAdmin!: boolean;
  created_at!: Date;
  updated_at!: Date;

  static tableName = "auth";

  static jsonSchema = {
    type: "object",
    required: ["email", "password"],
    properties: {
      id: { type: "integer", format: "uuid" },
      email: { type: "string", format: "email" },
      password: { type: "string" },
      isAdmin: { type: "boolean" },
    },
  };
}
