import React from "react";
import { columns, Cake } from "./columns";
import { DataTable } from "./data-table";

async function getData(): Promise<Cake[]> {
  // Fetch data from your API here.
  return [
    {
      id: 1,
      image: "image",
      cakeName: "Truffle Cake",
      price: 787,
      cakeType: "pastry",
      flavour: "chocolate",
      category: "birthday",
      status: "active",
    },
  ];
}
const CakeList = async () => {
  const data = await getData();

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default CakeList;
