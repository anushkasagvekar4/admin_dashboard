import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  //   await knex("cakes").del();

  // Inserts seed entries
  await knex("cakes").insert([
    {
      image: "https://example.com/images/mango_cake.jpg",
      cake_name: "Mango Delight",
      price: 250.0,
      cake_type: "cake",
      flavour: "mango",
      category: "festival",
      status: "active",
    },
    {
      image: "https://example.com/images/rajbhog_ladoo.jpg",
      cake_name: "Rajbhog Ladoo",
      price: 120.0,
      cake_type: "sweet",
      flavour: "saffron",
      category: "wedding",
      status: "active",
    },
    {
      image: "https://example.com/images/chocolate_cupcake.jpg",
      cake_name: "Chocolate Cupcake",
      price: 100.0,
      cake_type: "cupcake",
      flavour: "chocolate",
      category: "birthday",
      status: "inactive",
    },
  ]);
}
