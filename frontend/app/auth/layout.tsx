import Image from "next/image";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <main className="relative  flex flex-col-reverse sm:flex-row">
      <section className=" my-auto flex h-full min-h-screen flex-1 items-center bg-cover bg-top bg-dark-100 px-5 py-10-form">
        <div className="gradient-vertical mx-auto flex max-w-xl flex-col gap-6 rounded-lg p-10">
          <div className="flex flex-row items-center gap-3">
            <Image
              src="/icons/cakeadminlogo.png"
              alt="logo"
              width={60}
              height={60}
            />
            <h1 className="text-2xl font-semibold text-orange-950">
              CakeAdmin
            </h1>
          </div>

          <div>{children}</div>
        </div>
      </section>

      <section className="sticky h-40 w-full sm:top-0 sm:h-screen sm:flex-1">
        <Image
          src="/images/login-cake.jpg"
          alt="Cake"
          height={1000}
          width={1000}
          className="size-full object-cover"
        />
      </section>
    </main>
  );
}
