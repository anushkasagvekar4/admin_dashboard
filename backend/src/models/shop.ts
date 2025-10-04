import knex from "../db/knexInstance";
import { Model } from "objection";
import { Cake } from "./cake";

export class Shop extends Model {
  id!: string;
  shopname!: string;
  ownername!: string;
  email!: string;
  phone!: string;
  address!: string;
  city!: string;
  status!: "active" | "inactive";
  created_at!: Date;
  updated_at!: Date;

  static tableName = "shops";

  static relationMappings = {
    cakes: {
      relation: Model.HasManyRelation,
      modelClass: Cake,
      join: {
        from: "shops.id",
        to: "cakes.shopId",
      },
    },
  };

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
      status: { type: "string", enum: ["active", "inactive"] },
      created_at: { type: "string", format: "date-time" },
      updated_at: { type: "string", format: "date-time" },
    },
  };
}

Shop.knex(knex);
