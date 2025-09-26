import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("auth", (table) => {
    table
      .enum("role", ["super_admin", "shop_admin", "customer"])
      .notNullable()
      .defaultTo("customer");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("auth", (table) => {
    table.dropColumn("role");
  });
}
