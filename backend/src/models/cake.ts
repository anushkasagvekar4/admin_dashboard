import { Model } from "objection";
import knex from "../db/knexInstance";
import { Shop } from "./shop";

export class Cake extends Model {
  id!: string;
  shopId!: string; // the shop_admin who owns this cake
  images!: string[];
  cake_name!: string;
  price!: number;
  cake_type?: string;
  flavour?: string;
  category?: string;
  size?: string;
  noofpeople?: number;
  status!: "active" | "inactive";
  created_at!: Date;
  updated_at!: Date;

  static tableName = "cakes";

  static relationMappings = {
    shop: {
      relation: Model.BelongsToOneRelation,
      modelClass: Shop,
      join: {
        from: "cakes.shopId",
        to: "shops.id",
      },
    },
  };

  static jsonSchema = {
    type: "object",
    required: ["images", "cake_name", "price", "shopId"], // shopId required
    properties: {
      id: { type: "string", format: "uuid" },
      shopId: { type: "string", format: "uuid" },
      images: {
        type: "array", // ✅ change from string to array
        items: { type: "string" }, // each item must be a string
      },
      cake_name: { type: "string" },
      price: { type: "number", minimum: 0 },
      cake_type: { type: "string", nullable: true },
      flavour: { type: "string", nullable: true },
      category: { type: "string", nullable: true },
      size: { type: "string", nullable: true },
      noofpeople: { type: "integer", nullable: true }, // 👈 better as integer
      status: {
        type: "string",
        enum: ["active", "inactive"],
        default: "active",
      },
      created_at: { type: "string", format: "date-time" },
      updated_at: { type: "string", format: "date-time" },
    },
  };
}

// ✅ Bind this model to the Knex instance
Cake.knex(knex);
