import { Model } from "objection";
import { Order } from "./orders";
import { Cake } from "./cake";
import knex from "../db/knexInstance";
export class OrderItem extends Model {
  id!: string;
  order_id!: string;
  cake_id!: string;
  qty!: number;
  price!: number;
  created_at!: Date;
  updated_at!: Date;

  static tableName = "order_items";

  static relationMappings = () => ({
    order: {
      relation: Model.BelongsToOneRelation,
      modelClass: Order,
      join: {
        from: "order_items.order_id",
        to: "orders.id",
      },
    },
    cake: {
      relation: Model.BelongsToOneRelation,
      modelClass: Cake,
      join: {
        from: "order_items.cake_id",
        to: "cakes.id",
      },
    },
  });

  static jsonSchema = {
    type: "object",
    required: ["order_id", "cake_id", "qty", "price"],
    properties: {
      id: { type: "string", format: "uuid" },
      order_id: { type: "string", format: "uuid" },
      cake_id: { type: "string", format: "uuid" },
      qty: { type: "integer", minimum: 1 },
      price: { type: "number", minimum: 0 },
      created_at: { type: "string", format: "date-time" },
      updated_at: { type: "string", format: "date-time" },
    },
  };
}

OrderItem.knex(knex);
