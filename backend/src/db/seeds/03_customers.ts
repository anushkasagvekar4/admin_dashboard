import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  //   await knex("users").del();
  // Inserts seed entries
  await knex("users").insert({
    full_name: "Anushka Sagvekar",
    email: "anushka.sagvekar@example.com",
    address: "Sion, Mumbai, Maharashtra",
    phone: "9876543210",
    status: "active",
  });
}
