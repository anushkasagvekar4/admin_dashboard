import knex from "../db/knexInstance";
import { Model } from "objection";

export class WebsiteSettings extends Model {
  id!: string;
  site_name!: string;
  site_description?: string;
  contact_email!: string;
  contact_phone?: string;
  contact_address?: string;
  social_facebook?: string;
  social_instagram?: string;
  social_twitter?: string;
  social_linkedin?: string;
  logo_url?: string;
  favicon_url?: string;
  hero_title?: string;
  hero_description?: string;
  hero_bg_image?: string;
  about_us?: string;
  privacy_policy?: string;
  terms_of_service?: string;
  maintenance_mode!: boolean;
  maintenance_message?: string;
  created_at!: Date;
  updated_at!: Date;

  static tableName = "website_settings";

  static jsonSchema = {
    type: "object",
    required: ["site_name", "contact_email", "maintenance_mode"],
    properties: {
      id: { type: "string", format: "uuid" },
      site_name: { type: "string", minLength: 1, maxLength: 255 },
      site_description: { type: "string", maxLength: 1000 },
      contact_email: { type: "string", format: "email" },
      contact_phone: { type: "string", maxLength: 20 },
      contact_address: { type: "string", maxLength: 500 },
      social_facebook: { type: "string", maxLength: 255 },
      social_instagram: { type: "string", maxLength: 255 },
      social_twitter: { type: "string", maxLength: 255 },
      social_linkedin: { type: "string", maxLength: 255 },
      logo_url: { type: "string", maxLength: 500 },
      favicon_url: { type: "string", maxLength: 500 },
      hero_title: { type: "string", maxLength: 255 },
      hero_description: { type: "string", maxLength: 1000 },
      hero_bg_image: { type: "string", maxLength: 500 },
      about_us: { type: "string" },
      privacy_policy: { type: "string" },
      terms_of_service: { type: "string" },
      maintenance_mode: { type: "boolean" },
      maintenance_message: { type: "string", maxLength: 500 },
      created_at: { type: "string", format: "date-time" },
      updated_at: { type: "string", format: "date-time" },
    },
  };
}

WebsiteSettings.knex(knex);
