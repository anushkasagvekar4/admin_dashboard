import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  // await knex("table_name").del();
  // Inserts seed entries
  //   await knex("auth").insert({
  //     email: "admin123@gmail.com",
  //     password: "123456",
  //   });
}
