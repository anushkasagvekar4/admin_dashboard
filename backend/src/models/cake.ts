import { Model } from "objection";
import knex from "../db/knexInstance";

export class Cake extends Model {
  id!: string;
  shopId!: string; // the shop_admin who owns this cake
  image!: string;
  cake_name!: string;
  price!: number;
  cake_type?: string;
  flavour?: string;
  category?: string;
  size?: string;
  noofpeople?: string;
  status!: "active" | "inactive";
  created_at!: Date;
  updated_at!: Date;

  static tableName = "cakes";

  static jsonSchema = {
    type: "object",
    required: ["image", "cake_name", "price", "shopid"], // 👈 include shop_id
    properties: {
      id: { type: "string", format: "uuid" },
      shopId: { type: "string", format: "uuid" },
      image: { type: "string" },
      cake_name: { type: "string" },
      price: { type: "number", minimum: 0 },
      cake_type: { type: "string", nullable: true },
      flavour: { type: "string", nullable: true },
      category: { type: "string", nullable: true },
      size: { type: "string", nullable: true },
      noofpeople: { type: "string", nullable: true },
      status: {
        type: "string",
        enum: ["active", "inactive"],
        default: "active",
      },
      created_at: { type: "string", format: "date-time" },
      updated_at: { type: "string", format: "date-time" },

      // 👇 NEW FIELD in schema
    },
  };
}

// ✅ Bind this model to the Knex instance
Cake.knex(knex);
