// models/cart.ts
import { Model } from "objection";
import knex from "../db/knexInstance";
import { Cake } from "./cake";
import { Customer } from "./customer";

export class Cart extends Model {
  id!: string;
  userId!: string;
  cakeId!: string;
  quantity!: number;
  price!: number; // price at the time of adding
  created_at!: Date;
  updated_at!: Date;

  static tableName = "carts";

  static relationMappings = {
    cake: {
      relation: Model.BelongsToOneRelation,
      modelClass: Cake,
      join: {
        from: "carts.cakeId",
        to: "cakes.id",
      },
    },
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: Customer,
      join: {
        from: "carts.customerId",
        to: "Customer.id",
      },
    },
  };
}

// Bind knex
Cart.knex(knex);
