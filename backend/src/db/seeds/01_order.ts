import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("orders").del();

  // Inserts seed entries
  await knex("orders").insert({
    order_no: 8724,
    full_name: "Rajesh Kumar",
    email: "rajesh.kumar@example.com",
    address: "45 MG Road, Pune, Maharashtra",
    phone: 9876541230,
    order_date: new Date().toISOString(),
    status: "Pending",
  });
}
