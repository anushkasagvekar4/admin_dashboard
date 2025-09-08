"use client";
import AuthForm from "@/components/AuthForm";
import { signinSchema } from "@/lib/validations";
import { joiResolver } from "@hookform/resolvers/joi";
import React, { useState } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/Store";
import { useSelector } from "react-redux";
import { signinUser } from "@/app/features/auth/authApi";
import Link from "next/link";
import { useRouter } from "next/navigation";
export type SigninData = {
  email: string;
  password: string;
};
const Signin = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading, error } = useSelector(
    (state: RootState) => state.auth
  );
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SigninData>({
    resolver: joiResolver(signinSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: SigninData) => {
    dispatch(signinUser({ email: data.email, password: data.password }))
      .unwrap()
      .then(() => {
        router.push("/admin/customers");
      });
  };

  return (
    <>
      <div className="bg-orange-100 p-6 rounded-lg max-w-md ">
        <div>
          <h1 className="text-2xl text-orange-950 text-center mb-2 font-bold">
            Signin
          </h1>
        </div>
        <div className="">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
            <div>
              <label htmlFor="">Enter Email:</label>
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
              <label htmlFor="">Enter Password:</label>
              <input
                type="password"
                {...register("password")}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-orange-950 rounded-lg  hover:bg-orange-900 mt-6 py-2 text-white font-bold"
            >
              {loading || isSubmitting ? "Signing in..." : "Signin"}
            </button>
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
    </>
  );
};
export default Signin;
