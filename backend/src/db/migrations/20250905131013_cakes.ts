import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("cakes", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("image").notNullable();
    table.string("cake_name").notNullable();
    table.decimal("price", 10, 2).notNullable();
    table.string("cake_type");
    table.string("flavour");
    table.string("category");
    table.string("size");
    table.string("noofpeople");
    table.enum("status", ["active", "inactive"]).defaultTo("active"); // Active or inactive
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("cakes");
}
