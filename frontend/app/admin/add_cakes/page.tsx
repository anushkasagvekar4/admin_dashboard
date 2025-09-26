"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { addUser } from "@/app/features/users/userApi";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/app/store/Store";
import { useState } from "react";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// imporrt createCakesSchema
import { toast } from "sonner";
import { createCakesSchema } from "@/lib/validations";
// import { SelectPortal } from "@radix-ui/react-select";

interface CakeData {
  name: string;
  price: string;
  type: string;
  flavour: string;
  category: string;
  people: string;
  size: string;
}

export default function AddCake() {
  const dispatch = useDispatch<AppDispatch>();
  const [preview, setPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CakeData>({
    resolver: joiResolver(createCakesSchema), // Add validation schema if needed
    defaultValues: {
      name: "",
      price: "",
      type: "",
      flavour: "",
      category: "",
      people: "",
      size: "",
    },
  });

  const onSubmit = (data: CakeData) => {
    // Call your API here
    toast.success("Cake added successfully!");
    console.log(data);
  };

  return (
    <div className="container mx-auto py-12 md:py-16">
      <div className="mx-auto max-w-4xl rounded-2xl border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-extrabold mb-6 text-center">
          Add New Cake
        </h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Image */}
          <div className="space-y-2">
            <Label htmlFor="image">Cake Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              className="h-11 rounded-xl"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setPreview(URL.createObjectURL(file));
              }}
            />
            {preview && (
              <Image
                src={preview}
                alt="Cake Preview"
                width={150}
                height={150}
                className="object-cover rounded-xl"
              />
            )}
          </div>

          {/* Cake Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Cake Name</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Chocolate Delight"
              className="h-11 rounded-xl"
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              {...register("price")}
              placeholder="₹500"
              className="h-11 rounded-xl"
            />
          </div>

          {/* Cake Type */}
          <div className="space-y-2 overflow-visible">
            <Label htmlFor="type">Cake Type</Label>
            <Select {...register("type")}>
              <SelectTrigger className="h-15 rounded-xl">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Birthday">Birthday</SelectItem>
                <SelectItem value="Wedding">Wedding</SelectItem>
                <SelectItem value="Anniversary">Anniversary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Flavour */}
          <div className="space-y-2">
            <Label htmlFor="flavour">Flavour</Label>
            <Input
              id="flavour"
              {...register("flavour")}
              placeholder="Chocolate / Vanilla"
              className="h-11 rounded-xl"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              {...register("category")}
              placeholder="Premium / Regular"
              className="h-11 rounded-xl"
            />
          </div>

          {/* No. of People */}
          <div className="space-y-2">
            <Label htmlFor="people">Serves (No. of People)</Label>
            <Input
              id="people"
              type="number"
              {...register("people")}
              placeholder="10"
              className="h-11 rounded-xl"
            />
          </div>

          {/* Size */}
          <div className="space-y-2">
            <Label htmlFor="size">Size</Label>
            <Input
              id="size"
              {...register("size")}
              placeholder="Small / Medium / Large"
              className="h-11 rounded-xl"
            />
          </div>

          {/* Submit */}
          <div className="col-span-full mt-4">
            <Button
              type="submit"
              className="w-full h-11 rounded-xl"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Cake"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
