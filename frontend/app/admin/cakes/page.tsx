"use client";

import React, { useEffect, useState } from "react";
import { columns, Cake } from "./columns";
import { DataTable } from "./data-table";
import { useAppDispatch, useAppSelector } from "@/app/store/hook";
import {
  deleteCake,
  getCakes,
  toggleCakeStatus,
  updateCake,
} from "@/app/features/shop_admin/cakes/cakeApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  uploadImage,
  resetImage,
} from "@/app/features/common/imageUploadSlice";
import { number } from "joi";

const CakeList = () => {
  const dispatch = useAppDispatch();
  const { cakes, loading, error } = useAppSelector((state) => state.cakes);
  const [preview, setPreview] = useState<string | null>(null);
  const { url: uploadedUrl, status: uploadStatus } = useAppSelector(
    (state) => state.imageUpload
  );

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentCake, setCurrentCake] = useState<Cake | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null); // holds existing DB image

  useEffect(() => {
    dispatch(getCakes());
  }, [dispatch]);

  const handleView = (cake: Cake) => {
    setCurrentCake(cake);
    setViewModalOpen(true);
  };

  const handleEdit = (cake: Cake) => {
    setCurrentCake(cake);
    setEditModalOpen(true);
  };
  const handleFileChange = (file: File) => {
    if (file) {
      setPreview(URL.createObjectURL(file));
      dispatch(uploadImage(file)); // upload to Cloudinary
    }
  };

  const handleDelete = (id: string) => {
    dispatch(deleteCake(id));
  };

  const handleSaveEdit = (updatedData: Partial<Cake>) => {
    if (!currentCake) return;

    // ✅ Force numeric conversion before dispatch
    const formatted = {
      ...updatedData,
      price: Number(updatedData.price),
    };

    console.log("Sending data:", formatted, typeof formatted.price); // should print 'number'

    dispatch(updateCake({ id: currentCake.id, data: formatted }));

    setEditModalOpen(false);
  };

  const mappedCakes: Cake[] = cakes.map((c: any) => ({
    id: c.id,
    image: c.image,
    cakeName: c.cakeName,
    price: c.price,
    cakeType: c.cakeType,
    flavour: c.flavour,
    category: c.category,
    status: c.status,
    createdAt: c.created_at ? new Date(c.created_at) : undefined,
    updatedAt: c.updated_at ? new Date(c.updated_at) : undefined,
  }));

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error)
    return <div className="text-center py-10 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Cakes List</h1>

      {/* View Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>View Cake</DialogTitle>
          </DialogHeader>
          {currentCake && (
            <div className="space-y-2">
              <img
                src={preview || currentCake?.image || "/placeholder.png"}
                alt="Cake Image"
                className="w-40 h-40 object-cover rounded"
              />

              <p>
                <strong>Name:</strong> {currentCake.cakeName}
              </p>
              <p>
                <strong>Type:</strong> {currentCake.cakeType}
              </p>
              <p>
                <strong>Flavour:</strong> {currentCake.flavour}
              </p>
              <p>
                <strong>Category:</strong> {currentCake.category}
              </p>
              <p>
                <strong>Price:</strong> ₹{currentCake.price}
              </p>
              <p>
                <strong>Status:</strong> {currentCake.status}
              </p>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Cake Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Cake</DialogTitle>
          </DialogHeader>

          {currentCake && (
            <div className="space-y-3">
              {/* Image URL */}
              <div className="space-y-2">
                <Label> Cake Image </Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileChange(file);
                  }}
                  className="h-11 rounded-xl"
                />
                {/* Preview */}
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-40 h-40 object-cover rounded"
                  />
                ) : currentCake?.image ? (
                  <img
                    src={currentCake.image}
                    alt="Current Image"
                    className="w-40 h-40 object-cover rounded"
                  />
                ) : null}

                {uploadStatus === "loading" && (
                  <p className="text-sm text-blue-500">Uploading...</p>
                )}
                {uploadStatus === "failed" && (
                  <p className="text-sm text-red-500">
                    Upload failed. Try again.
                  </p>
                )}
              </div>

              {/* Cake Name */}
              <input
                type="text"
                defaultValue={currentCake.cakeName}
                onChange={(e) =>
                  setCurrentCake({ ...currentCake, cakeName: e.target.value })
                }
                className="border p-2 w-full rounded"
                placeholder="Cake Name"
              />

              {/* Price */}
              <input
                type="number"
                defaultValue={currentCake.price}
                onChange={(e) =>
                  setCurrentCake({
                    ...currentCake,
                    price: Number(e.target.value),
                  })
                }
                className="border p-2 w-full rounded"
                placeholder="Price"
              />

              {/* Cake Type */}
              <input
                type="text"
                defaultValue={currentCake.cakeType}
                onChange={(e) =>
                  setCurrentCake({ ...currentCake, cakeType: e.target.value })
                }
                className="border p-2 w-full rounded"
                placeholder="Cake Type"
              />

              {/* Flavour */}
              <input
                type="text"
                defaultValue={currentCake.flavour}
                onChange={(e) =>
                  setCurrentCake({ ...currentCake, flavour: e.target.value })
                }
                className="border p-2 w-full rounded"
                placeholder="Flavour"
              />

              {/* Category */}
              <input
                type="text"
                defaultValue={currentCake.category}
                onChange={(e) =>
                  setCurrentCake({ ...currentCake, category: e.target.value })
                }
                className="border p-2 w-full rounded"
                placeholder="Category"
              />
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              onClick={() => {
                if (!currentCake) return;
                const imageToUse = uploadedUrl || currentCake.image; // uploaded or existing
                handleSaveEdit({
                  image: imageToUse,
                  cakeName: currentCake.cakeName,
                  price: currentCake.price,
                  cakeType: currentCake.cakeType,
                  flavour: currentCake.flavour,
                  category: currentCake.category,
                  status: currentCake.status as "active" | "inactive",
                });
                setPreview(null);
                dispatch(resetImage());
              }}
            >
              Save
            </Button>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DataTable */}
      <DataTable
        columns={columns({
          handleView,
          handleEdit,
          handleDelete,
          handleToggleStatus: (id: string) => dispatch(toggleCakeStatus(id)),
        })}
        data={mappedCakes}
      />
    </div>
  );
};

export default CakeList;
