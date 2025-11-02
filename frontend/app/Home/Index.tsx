"use client";
import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./SectionHeading";
import { RatingStars } from "./RatingStars";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, CreditCard, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { addToCartAPI } from "../features/orders/cartApi";
import { getCakes } from "../features/shop_admin/cakes/cakeApi";
import { AppDispatch, RootState } from "../store/Store";
import Swal from "sweetalert2";
export default function Index() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // ✅ Fetch cakes and auth data from Redux
  const { cakes, loading, error } = useSelector(
    (state: RootState) => state.cakes
  );
  const token = useSelector((state: RootState) => state.auth.token);

  // ✅ Fetch cakes on page load
  useEffect(() => {
    dispatch(getCakes());
  }, [dispatch]);

  // ✅ Take only first 6 cakes for "Featured" section
  const featured = useMemo(() => cakes.slice(0, 6), [cakes]);
  const handleAddToCart = async (cake: any) => {
    if (!token) {
      const result = await Swal.fire({
        title: "Login Required",
        text: "Please login to add items to your cart.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Go to Login",
      });

      if (result.isConfirmed) {
        router.push("/auth/signin");
      }
      return;
    }

    try {
      await dispatch(
        addToCartAPI({
          cakeId: cake.id,
          quantity: 1,
          price: cake.price,
        })
      ).unwrap();

      // ✅ await SweetAlert before redirecting
      await Swal.fire({
        title: "Added to Cart!",
        text: `${cake.cake_name} has been added to your cart.`,
        icon: "success",
        confirmButtonColor: "#3085d6",
      });

      router.push("/customer/cart"); // redirect after SweetAlert
    } catch (error: any) {
      console.error("Failed to add to cart:", error);
      Swal.fire({
        title: "Error",
        text: "Something went wrong while adding to cart.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  };

  // ✅ UI starts here
  return (
    <main>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-100 via-white to-transparent" />
        <div className="container mx-auto grid lg:grid-cols-2 gap-8 items-center py-12 md:py-16">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight">
              Discover, compare, and order cakes you love
            </h1>
            <p className="mt-4 text-muted-foreground max-w-xl">
              CakeHaven brings the best local bakeries to your fingertips.
              Browse flavors, check ratings, and get delicious cakes delivered
              fast.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Link href="#featured">
                <Button className="h-12 rounded-xl px-6">Browse Cakes</Button>
              </Link>
              <Link href="/shops">
                <Button variant="secondary" className="h-12 rounded-xl px-6">
                  Order Now
                </Button>
              </Link>
            </div>
            <div className="mt-6 flex items-center gap-5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Search size={18} />
                <span>Search flavors</span>
              </div>
              <div className="flex items-center gap-2">
                <ShoppingCart size={18} />
                <span>Fast checkout</span>
              </div>
              <div className="flex items-center gap-2">
                <PartyPopper size={18} />
                <span>Fresh & tasty</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-border">
              <Image
                src={"/images/home-cake.jpg"}
                alt="Assorted cakes"
                height={371}
                width={281}
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cakes Section */}
      <section id="featured" className="container mx-auto py-12 md:py-16">
        <SectionHeading
          title="Featured Cakes"
          subtitle="Popular picks from our community"
        />

        {loading ? (
          <p>Loading cakes...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : featured.length === 0 ? (
          <p>No cakes available.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((c) => (
              <div
                key={c.id}
                className="group rounded-2xl overflow-hidden border bg-card shadow-sm hover:shadow-md transition-all"
              >
                <div className="relative">
                  <img
                    src={c.images?.[0] || "/placeholder.jpg"}
                    alt={c.cake_name}
                    className="h-52 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 bg-background/90 backdrop-blur px-2 py-1 rounded-md text-xs font-semibold ring-1 ring-border">
                    ₹{Number(c.price).toFixed(2)}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{c.cake_name}</div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <RatingStars rating={4.8} className="flex" />
                        <span>4.8</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    className="mt-3 w-full"
                    onClick={() => handleAddToCart(c)}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="container mx-auto py-12 md:py-16">
        <SectionHeading
          title="How it works"
          subtitle="Order your favorite cake in just a few steps"
        />
        <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Search,
              title: "Browse",
              desc: "Find cakes and shops near you",
            },
            {
              icon: ShoppingCart,
              title: "Add to Cart",
              desc: "Pick your favorites",
            },
            {
              icon: CreditCard,
              title: "Checkout",
              desc: "Secure and fast payment",
            },
            {
              icon: PartyPopper,
              title: "Enjoy",
              desc: "Fresh cake at your door",
            },
          ].map((s, i) => (
            <li
              key={s.title}
              className="rounded-2xl border bg-card p-6 text-center"
            >
              <div
                className={cn(
                  "mx-auto mb-3 size-12 rounded-full flex items-center justify-center",
                  "bg-primary/15 text-primary"
                )}
              >
                <s.icon />
              </div>
              <div className="font-semibold">
                {i + 1}. {s.title}
              </div>
              <div className="text-sm text-muted-foreground mt-1">{s.desc}</div>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
