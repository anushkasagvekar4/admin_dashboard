import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("auth", (table) => {
    table.increments("id").primary(); // Primary key
    table.string("email").notNullable().unique(); // Unique login email
    table.string("password").notNullable(); // Store hashed password
    table.boolean("isAdmin").notNullable().defaultTo(true); // Admin flag
    table.timestamps(true, true); // created_at, updated_at
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("auth");
}
