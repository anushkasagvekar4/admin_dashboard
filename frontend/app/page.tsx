"use client";
import Link from "next/link";
// import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Navbar } from "./Home/Navbar";
import { Footer } from "./Home/Footer";
import { SectionHeading } from "./Home/SectionHeading";
import { RatingStars } from "./Home/RatingStars";
import Index from "./Home/Index";

export default function Home() {
  // const router = useRouter();

  return (
    <div>
      <Navbar />
      {/* <SectionHeading /> */}
      <Index />
      {/* <RatingStars /> */}
      <Footer />
    </div>
  );
}
