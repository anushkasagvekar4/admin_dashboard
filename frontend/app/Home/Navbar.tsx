"use client";
import { FormEvent, useState } from "react";
// import useNavigate from "react-router-dom";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Cookie, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
interface NavbarProps {
  cartCount: number;
}

export function Navbar({ cartCount }: NavbarProps) {
  const router = useRouter();
  const [type, setType] = useState<"cakes" | "shops">("cakes");
  const [query, setQuery] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({ type, q: query }).toString();
    router.push(`/search?${params}`);
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-background/70 bg-background/80 border-b">
      <div className="container mx-auto flex items-center gap-4 py-3">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="size-9 rounded-full bg-primary/15 flex items-center justify-center">
            <Cookie className="text-primary" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">
            CakeHaven
          </span>
        </Link>

        <form
          onSubmit={onSubmit}
          className="hidden md:flex items-center gap-2 flex-1 max-w-2xl mx-auto"
        >
          <div className="inline-flex rounded-md p-1 bg-secondary text-sm">
            {(["cakes", "shops"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={cn(
                  "px-3 py-1.5 rounded-md capitalize",
                  type === t
                    ? "bg-background shadow text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${type}...`}
              className="pl-9 h-11 rounded-xl"
            />
          </div>
          <Button className="h-11 rounded-xl px-5">Search</Button>
        </form>

        <nav className="ml-auto flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href="/auth/signin">Sign in</Link>
          </Button>

          <Button asChild>
            <Link href="/auth/signup">Sign up</Link>
          </Button>

          <Button
            variant="secondary"
            className="relative"
            onClick={() => router.push("/cart")}
            aria-label="Cart"
          >
            <ShoppingCart />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full px-1.5 py-0.5">
                {cartCount}
              </span>
            )}
          </Button>
        </nav>
      </div>

      <form onSubmit={onSubmit} className="md:hidden px-4 pb-3">
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-md p-1 bg-secondary text-sm">
            {(["cakes", "shops"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={cn(
                  "px-3 py-1.5 rounded-md capitalize",
                  type === t
                    ? "bg-background shadow text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${type}...`}
              className="pl-9 h-11 rounded-xl"
            />
          </div>
          <Button className="h-11 rounded-xl px-5">Go</Button>
        </div>
      </form>
    </header>
  );
}
