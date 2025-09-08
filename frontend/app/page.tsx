"use client";
import Link from "next/link";
// import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Home() {
  // const router = useRouter();

  return (
    <div
      className="flex flex-col justify-center items-center bg-cover h-screen"
      style={{ backgroundImage: "url('/images/bgCake.jpg')" }}
    >
      <div className="bg-orange-100/65 bg-opacity-23 p-9 text-center">
        <h1 className="text-4xl text-orange-950 mb-6">Welcome Admin!</h1>
        {/* <Button
          className="bg-orange-950 w-full hover:bg-orange-900 text-white rounded-lg"
          onClick={() => {
            router.push("/auth/signin");
          }}
        >
          Click Here to Login
        </Button> */}
        <Link href="/auth/signin">
          <Button className="bg-orange-950 w-full hover:bg-orange-900 text-white rounded-lg">
            Click Here to Login
          </Button>
        </Link>
      </div>
    </div>
  );
}
