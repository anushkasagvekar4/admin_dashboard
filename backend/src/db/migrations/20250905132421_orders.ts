import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("orders", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()")); // Unique ID for each order
    table.integer("order_no").notNullable().unique(); // Order number
    table.uuid("user_id").notNullable(); // Reference to the user who placed the order
    table
      .foreign("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    table.specificType("cakes", "uuid[]").notNullable().defaultTo("{}"); // Array of cake name
    table
      .enum("status", ["Pending", "Completed", "Cancelled"])
      .defaultTo("Pending");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("orders");
}
