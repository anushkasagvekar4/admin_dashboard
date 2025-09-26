import knex from "../db/knexInstance";
import { Model } from "objection";

export class Enquiry extends Model {
  id!: string;
  shopname!: string;
  ownername!: string;
  email!: string;
  phone!: string;
  address!: string;
  city!: string;
  status!: "pending" | "approved" | "rejected";
  reason?: string;
  created_at!: Date;
  updated_at!: Date;

  static tableName = "enquiry";

  static jsonSchema = {
    type: "object",
    required: ["shopname", "ownername", "email", "phone", "address", "city"],
    properties: {
      id: { type: "string", format: "uuid" },
      shopname: { type: "string" },
      ownername: { type: "string" },
      email: { type: "string", format: "email" },
      phone: { type: "string" },
      address: { type: "string" },
      city: { type: "string" },
      status: { type: "string", enum: ["pending", "approved", "rejected"] },
      reason: { type: "string" },
      created_at: { type: "string", format: "date-time" },
      updated_at: { type: "string", format: "date-time" },
    },
  };
}

Enquiry.knex(knex);
