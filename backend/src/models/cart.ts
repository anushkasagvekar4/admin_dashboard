import { Model, snakeCaseMappers } from "objection";
import knex from "../db/knexInstance";
import { Cake } from "./cake";
import { Customer } from "./customer";

export class Cart extends Model {
  id!: string;
  customerId!: string; // ✅ rename to match DB
  cakeId!: string;
  quantity!: number;
  price!: number;
  created_at!: Date;
  updated_at!: Date;

  static tableName = "cart"; // ✅ matches DB

  static columnNameMappers = snakeCaseMappers();

  static relationMappings = {
    cake: {
      relation: Model.BelongsToOneRelation,
      modelClass: Cake,
      join: {
        from: "cart.cake_id", // ✅ correct table name
        to: "cakes.id",
      },
    },
    customer: {
      // ✅ rename from user → customer
      relation: Model.BelongsToOneRelation,
      modelClass: Customer,
      join: {
        from: "cart.customer_id", // ✅ correct column name
        to: "customers.id",
      },
    },
  };

  static jsonSchema = {
    type: "object",
    required: ["customerId", "cakeId", "quantity", "price"],
    properties: {
      id: { type: "string", format: "uuid" },
      customerId: { type: "string", format: "uuid" },
      cakeId: { type: "string", format: "uuid" },
      quantity: { type: "integer", minimum: 1 },
      price: { type: "number", minimum: 0 },
    },
  };
}

Cart.knex(knex);
