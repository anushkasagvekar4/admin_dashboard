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

import { uploadMultipleImagesToCloudinary } from "@/app/features/common/imageUploadApi";
import { createCake } from "@/app/features/shop_admin/cakes/cakeApi";
import {
  addPreviewImage,
  removePreviewImage,
} from "@/app/features/shop_admin/cakes/cakeSlice";

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
  const { loading } = useSelector((state: RootState) => state.cakes);
  const selectedCake = useSelector(
    (state: RootState) => state.cakes.selectedCake
  );

  const [previews, setPreviews] = useState<string[]>([]); // local preview
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]); // local uploaded URLs
  const [uploading, setUploading] = useState(false);

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

  const handleFilesChange = async (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);

    // generate new previews
    const newPreviewUrls = fileArray.map((file) => URL.createObjectURL(file));

    // append to existing previews
    setPreviews((prev) => [...prev, ...newPreviewUrls]);

    // start uploading
    setUploading(true);
    try {
      const newUrls = await uploadMultipleImagesToCloudinary(fileArray);

      // append uploaded URLs to existing ones
      setUploadedUrls((prev) => [...prev, ...newUrls]);

      toast.success("Images uploaded successfully!");
    } catch (err: any) {
      toast.error(err.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePreview = (index: number) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setUploadedUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CakeForm) => {
    if (uploadedUrls.length === 0) {
      toast.error("Please upload at least one image before submitting");
      return;
    }

    const cakeData = {
      ...data,
      images: uploadedUrls,
    };

    try {
      await dispatch(createCake(cakeData)).unwrap();
      toast.success("Cake added successfully!");
      reset();
      setValue("cake_type", "");
      setPreviews([]);
      setUploadedUrls([]);
    } catch (err: any) {
      toast.error(err || "Failed to add cake");
    }
  };

  const handleRemoveImage = (index: number) => {
    dispatch(removePreviewImage(index));
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
          {/* Multiple Images */}
          <div className="space-y-2 col-span-full">
            <Label htmlFor="images">Cake Images</Label>
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              className="h-11 rounded-xl"
              onChange={(e) => handleFilesChange(e.target.files)}
            />

            <div className="flex gap-2 flex-wrap mt-2">
              {previews.map((url, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={url}
                    alt={`Cake preview ${idx + 1}`}
                    width={100}
                    height={100}
                    className="object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePreview(idx)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            {uploading && <p className="text-blue-500">Uploading...</p>}
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
              disabled={loading || uploading}
            >
              {loading || uploading ? "Adding..." : "Add Cake"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
