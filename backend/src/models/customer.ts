import { Model } from "objection";
import { Auth } from "./auth";
import knex from "../db/knexInstance";
export class Customer extends Model {
  id!: string;
  auth_id!: string;
  full_name!: string;
  email!: string;
  address!: string;
  phone!: string;
  status!: "active" | "inactive";
  created_at!: Date;
  updated_at!: Date;

  static tableName = "customers";

  static relationMappings = () => ({
    auth: {
      relation: Model.BelongsToOneRelation,
      modelClass: Auth,
      join: {
        from: "customers.auth_id", // FK here
        to: "auth.id", // PK in auth table
      },
    },
  });

  static jsonSchema = {
    type: "object",
    required: ["auth_id", "full_name", "email", "address", "phone"],
    properties: {
      id: { type: "string", format: "uuid" },
      auth_id: { type: "string", format: "uuid" }, // ✅ new field
      full_name: { type: "string" },
      email: { type: "string", format: "email" },
      address: { type: "string" },
      phone: { type: "string" },
      status: { type: "string", enum: ["active", "inactive"] },
    },
  };
}

Customer.knex(knex);
