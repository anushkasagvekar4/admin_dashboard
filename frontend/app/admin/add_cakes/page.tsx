"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/Store";
import { useState } from "react";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { toast } from "sonner";
import { createCakesSchema } from "@/lib/validations";

// slices
import {
  uploadImage,
  resetImage,
} from "@/app/features/common/imageUploadSlice";
import { createCake } from "@/app/features/shop_admin/cakes/cakeApi";

interface CakeForm {
  cake_name: string;
  price: number;
  cake_type?: string;
  flavour?: string;
  category?: string;
  noofpeople?: number;
  size?: string;
}

export default function AddCake() {
  const dispatch = useDispatch<AppDispatch>();
  const { url: uploadedUrl, status: uploadStatus } = useSelector(
    (state: RootState) => state.imageUpload
  );
  const { loading } = useSelector((state: RootState) => state.cakes);

  const [preview, setPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CakeForm>({
    resolver: joiResolver(createCakesSchema),
    defaultValues: {
      cake_name: "",
      price: 0,
      cake_type: "",
      flavour: "",
      category: "",
      noofpeople: 0,
      size: "",
    },
  });

  const handleFileChange = (file: File) => {
    if (file) {
      setPreview(URL.createObjectURL(file));
      dispatch(uploadImage(file));
    }
  };

  const onSubmit = async (data: CakeForm) => {
    if (!uploadedUrl) {
      toast.error("Please upload an image before submitting");
      return;
    }

    const cakeData = {
      ...data,
      image: uploadedUrl,
    };

    try {
      await dispatch(createCake(cakeData)).unwrap();
      toast.success("Cake added successfully!");
      reset(); // clears form fields
      setValue("cake_type", ""); // reset Select
      setPreview(null);
      dispatch(resetImage()); // clears image from slice
    } catch (err: any) {
      toast.error(err || "Failed to add cake");
    }
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
                if (file) handleFileChange(file);
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
            {uploadStatus === "loading" && (
              <p className="text-sm text-blue-500">Uploading...</p>
            )}
            {uploadStatus === "failed" && (
              <p className="text-sm text-red-500">Upload failed. Try again.</p>
            )}
          </div>

          {/* Cake Name */}
          <div className="space-y-2">
            <Label htmlFor="cake_name">Cake Name</Label>
            <Input
              id="cake_name"
              {...register("cake_name")}
              placeholder="Chocolate Delight"
              className="h-11 rounded-xl"
            />
            {errors.cake_name && (
              <p className="text-sm text-red-500">
                {errors.cake_name.message as string}
              </p>
            )}
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              {...register("price", { valueAsNumber: true })}
              placeholder="₹500"
              className="h-11 rounded-xl"
            />
          </div>

          {/* Cake Type */}
          <div className="space-y-2 overflow-visible">
            <Label htmlFor="cake_type">Cake Type</Label>
            <Select
              onValueChange={(value) => setValue("cake_type", value)}
              defaultValue=""
            >
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
            <Label htmlFor="noofpeople">Serves (No. of People)</Label>
            <Input
              id="noofpeople"
              type="number"
              {...register("noofpeople")}
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
              disabled={loading || uploadStatus === "loading"}
            >
              {loading ? "Adding..." : "Add Cake"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
