import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("users", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()")); // UUID primary key
    table.string("full_name").notNullable(); // User full name
    table.string("email").notNullable().unique(); // Unique email
    table.string("address"); // Address
    table.string("phone"); // Phone as string for flexibility
    table.enum("status", ["active", "inactive"]).defaultTo("active"); // Only 'active' or 'inactive'
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("users");
}
