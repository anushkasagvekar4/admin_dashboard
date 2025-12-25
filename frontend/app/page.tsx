"use client";
import Link from "next/link";
// import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Navbar } from "./Home/Navbar";
import { Footer } from "./Home/Footer";
import { SectionHeading } from "./Home/SectionHeading";
import { RatingStars } from "./Home/RatingStars";
import Index from "./Home/Index";
import { useState } from "react";

export default function Home() {
  // const router = useRouter();
  const [viewMode, setViewMode] = useState<"cakes" | "shops">("cakes");

  return (
    <div>
      <Navbar cartCount={0} viewMode={viewMode} onViewModeChange={setViewMode} />
      {/* <SectionHeading /> */}
      <Index viewMode={viewMode} onViewModeChange={setViewMode} />
      {/* <RatingStars /> */}
      <Footer />
    </div>
  );
}
