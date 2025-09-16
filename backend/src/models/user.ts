import { Model } from "objection";
export class User extends Model {
  id!: string;
  full_name!: string;
  email!: string;
  address!: string;
  phone!: string;
  status!: "active" | "inactive";
  created_at!: Date;
  updated_at!: Date;

  static tableName = "users";

  static jsonSchema = {
    type: "object",
    required: ["full_name", "email", "address", "phone"],
    properties: {
      id: { type: "string", format: "uuid" },
      full_name: { type: "string" },
      email: { type: "string", format: "email" },
      address: { type: "string" },
      phone: { type: "string" },
      status: { type: "string", enum: ["active", "inactive"] },
    },
  };
}
