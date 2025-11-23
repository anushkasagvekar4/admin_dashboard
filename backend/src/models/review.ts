import { Model } from "objection";
import knex from "../db/knexInstance";
import { Cake } from "./cake";
import { Customer } from "./customer";

export class Review extends Model {
  id!: string;
  cake_id!: string;
  customer_id!: string;
  rating!: number;
  comment?: string;
  created_at!: Date;
  updated_at!: Date;

  static tableName = "reviews";

  static relationMappings = () => ({
    cake: {
      relation: Model.BelongsToOneRelation,
      modelClass: Cake,
      join: {
        from: "reviews.cake_id",
        to: "cakes.id",
      },
    },
    customer: {
      relation: Model.BelongsToOneRelation,
      modelClass: Customer,
      join: {
        from: "reviews.customer_id",
        to: "customers.id",
      },
    },
  });

  static jsonSchema = {
    type: "object",
    required: ["cake_id", "customer_id", "rating"],
    properties: {
      id: { type: "string", format: "uuid" },
      cake_id: { type: "string", format: "uuid" },
      customer_id: { type: "string", format: "uuid" },
      rating: { type: "integer", minimum: 1, maximum: 5 },
      comment: { type: "string", nullable: true },
      created_at: { type: "string", format: "date-time" },
      updated_at: { type: "string", format: "date-time" },
    },
  };
}

Review.knex(knex);
