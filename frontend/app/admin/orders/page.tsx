import React from "react";
import { columns, Order } from "./columns";
import { DataTable } from "./data-table";

async function getData(): Promise<Order[]> {
  // Fetch data from your API here.
  return [
    {
      id: 1,
      order_no: 67676,
      full_name: "Anushka",
      email: "a@g.com",
      address: "sion",
      phone: 37489,
      order_date: "12-02-2023",
      status: "Confirmed",
    },
  ];
}

const Orders = async () => {
  const data = await getData();

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default Orders;
