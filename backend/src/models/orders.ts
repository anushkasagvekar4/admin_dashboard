import { Model } from "objection";
import { OrderItem } from "./orderItems";
import { Customer } from "./customer";
import knex from "../db/knexInstance";
export class Order extends Model {
  id!: number;
  order_no!: number;
  customer_id!: string;
  status!: "Pending" | "Completed" | "Cancelled";
  tracking_status!: "Order Placed" | "Processing" | "Shipped" | "Out for Delivery" | "Delivered" | "Cancelled";
  created_at!: string;
  updated_at!: string;

  static tableName = "orders";

  static relationMappings = () => ({
    customer: {
      relation: Model.BelongsToOneRelation,
      modelClass: Customer,
      join: {
        from: "orders.customer_id",
        to: "customers.id",
      },
    },
    items: {
      relation: Model.HasManyRelation,
      modelClass: OrderItem,
      join: {
        from: "orders.id",
        to: "order_items.order_id",
      },
    },
  });

  static jsonSchema = {
    type: "object",
    required: ["order_no", "customer_id"],
    properties: {
      id: { type: "integer" },
      order_no: { type: "integer" },
      customer_id: { type: "string", format: "uuid" },
      status: {
        type: "string",
        enum: ["Pending", "Completed", "Cancelled"],
        default: "Pending",
      },
      tracking_status: {
        type: "string",
        enum: ["Order Placed", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"],
        default: "Order Placed",
      },
      created_at: { type: "string", format: "date-time" },
      updated_at: { type: "string", format: "date-time" },
    },
  };
}

Order.knex(knex);
