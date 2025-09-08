"use client";
import { addUser } from "@/app/features/users/userApi";
import { useAppDispatch, useAppSelector } from "@/app/store/hook";
import { AppDispatch, RootState } from "@/app/store/Store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createUserSchema } from "@/lib/validations";
import { joiResolver } from "@hookform/resolvers/joi";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";

interface userData {
  full_name: string;
  email: string;
  address: string;
  phone: string;
}

const page = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading, error } = useAppSelector(
    (state: RootState) => state.auth
  );
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<userData>({
    resolver: joiResolver(createUserSchema),
    defaultValues: {
      full_name: "",
      email: "",
      address: "",
      phone: "",
    },
  });

  const onSubmit = (data: userData) => {
    dispatch(
      addUser({
        full_name: data.full_name,
        email: data.email,
        address: data.address,
        phone: data.address,
      })
    )
      .unwrap()
      .then(() => {
        router.push("/admin/customers");
      });
  };
  return (
    <div className="bg-orange-100 p-6 rounded-lg max-w-md mx-auto">
      <div>
        <h1 className="text-2xl text-orange-950 text-center mb-2 font-bold">
          Add User
        </h1>
      </div>
      <div className="">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <div>
            <label htmlFor="">Enter User's Full Name::</label>
            <input
              type="text"
              {...register("full_name")}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.full_name && (
              <p className="text-red-500 text-sm">{errors.full_name.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="">Enter User Email:</label>
            <input
              type="email"
              {...register("email")}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="">Enter User Address:</label>
            <input
              type="text"
              {...register("address")}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.address && (
              <p className="text-red-500 text-sm">{errors.address.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="">Enter Phone:</label>
            <input
              type="text"
              {...register("phone")}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone.message}</p>
            )}
          </div>

          <Button
            variant={"outline"}
            type="submit"
            className="w-full rounded-lg  hover:bg-orange-900  text-white  mt-6 py-2 bg-orange-950 font-bold"
          >
            {loading || isSubmitting ? "Adding User..." : "Add User"}
          </Button>
          {/* Server Error */}
          {error && (
            <p className="text-red-600 text-sm text-center mt-3">{error}</p>
          )}
        </form>
        {/* <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-500 hover:underline">
              Signup
            </Link>
          </p> */}
      </div>
    </div>
  );
};

export default page;
