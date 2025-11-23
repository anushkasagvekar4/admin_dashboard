// "use client";
// import { ColumnDef } from "@tanstack/react-table";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Eye, Edit, Trash2 } from "lucide-react";

// export type Cake = {
//   id: string;
//   cake_name: string;
//   cake_type: string;
//   flavour: string;
//   category: string;
//   price: number;
//   status: string;
//   images: string[];
// };

// export const columns = (
//   handleView: (cake: Cake) => void,
//   handleEdit: (cake: Cake) => void,
//   handleDelete: (id: string) => void
// ): ColumnDef<Cake>[] => [
//   {
//     accessorKey: "images",
//     header: "Image",
//     cell: ({ row }) => {
//       const firstImage = row.original.images?.[0];
//       return (
//         <img
//           src={firstImage || "/placeholder.jpg"}
//           alt="Cake"
//           className="w-16 h-16 object-cover rounded-lg border shadow-sm"
//         />
//       );
//     },
//   },
//   {
//     accessorKey: "cake_name",
//     header: "Cake Name",
//     cell: ({ row }) => (
//       <span className="font-semibold text-gray-800">
//         {row.original.cake_name}
//       </span>
//     ),
//   },
//   {
//     accessorKey: "category",
//     header: "Category",
//   },
//   {
//     accessorKey: "flavour",
//     header: "Flavour",
//   },
//   {
//     accessorKey: "price",
//     header: "Price (₹)",
//     cell: ({ row }) => (
//       <span className="font-medium text-green-600">
//         ₹{row.original.price.toLocaleString()}
//       </span>
//     ),
//   },
//   {
//     accessorKey: "status",
//     header: "Status",
//     cell: ({ row }) => (
//       <Badge
//         className={`${
//           row.original.status === "active"
//             ? "bg-green-100 text-green-700"
//             : "bg-gray-200 text-gray-600"
//         } px-3 py-1 rounded-full`}
//       >
//         {row.original.status}
//       </Badge>
//     ),
//   },
//   {
//     id: "actions",
//     header: "Actions",
//     cell: ({ row }) => {
//       const cake = row.original;
//       return (
//         <div className="flex items-center gap-2">
//           <Button
//             size="sm"
//             variant="ghost"
//             onClick={() => handleView(cake)}
//             title="View"
//           >
//             <Eye className="w-4 h-4 text-blue-500" />
//           </Button>
//           <Button
//             size="sm"
//             variant="ghost"
//             onClick={() => handleEdit(cake)}
//             title="Edit"
//           >
//             <Edit className="w-4 h-4 text-green-600" />
//           </Button>
//           <Button
//             size="sm"
//             variant="ghost"
//             onClick={() => handleDelete(cake.id)}
//             title="Delete"
//           >
//             <Trash2 className="w-4 h-4 text-red-500" />
//           </Button>
//         </div>
//       );
//     },
//   },
// ];
