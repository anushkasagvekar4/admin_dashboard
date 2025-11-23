import knex from "../db/knexInstance";
import { Model } from "objection";
import { Cake } from "./cake";
import { Auth } from "./auth";

export class Shop extends Model {
  id!: string;
  auth_id!: string;
  shopname!: string;
  ownername!: string;
  email!: string;
  phone!: string;
  address!: string;
  city!: string;
  logo?: string;
  status!: "active" | "inactive";
  created_at!: Date;
  updated_at!: Date;

  static tableName = "shops";

  static relationMappings = {
    auth: {
      relation: Model.BelongsToOneRelation,
      modelClass: Auth,
      join: {
        from: "shops.auth_id",
        to: "auth.id",
      },
    },

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
    required: [
      "auth_id",
      "shopname",
      "ownername",
      "email",
      "phone",
      "address",
      "city",
    ],
    properties: {
      id: { type: "string", format: "uuid" },
      auth_id: { type: "string", format: "uuid" },

      shopname: { type: "string" },
      ownername: { type: "string" },
      email: { type: "string", format: "email" },
      phone: { type: "string" },
      address: { type: "string" },
      city: { type: "string" },
      logo: { type: "string" },

      status: { type: "string", enum: ["active", "inactive"] },
      created_at: { type: "string", format: "date-time" },
      updated_at: { type: "string", format: "date-time" },
    },
  };
}

Shop.knex(knex);
