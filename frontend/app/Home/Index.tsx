"use client";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./SectionHeading";
import { RatingStars } from "./RatingStars";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  CreditCard,
  PartyPopper,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
  Award,
  Store,
  ToggleLeft,
  ToggleRight,
  MapPin,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { addToCartAPI } from "../features/orders/cartApi";
import { getCakes } from "../features/shop_admin/cakes/cakeApi";
import { fetchActiveShops } from "../features/shops/shopsApi";
import { AppDispatch, RootState } from "../store/Store";
import Swal from "sweetalert2";
export default function Index() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // ✅ Fetch cakes and auth data from Redux
  const { cakes, loading, error } = useSelector(
    (state: RootState) => state.cakes
  );
  const { shops, loading: shopsLoading, error: shopsError } = useSelector(
    (state: RootState) => state.publicShops
  );
  const token = useSelector((state: RootState) => state.auth.token);

  // ✅ Shop toggle state
  const [shopEnabled, setShopEnabled] = useState(true);
  const [showShopInfo, setShowShopInfo] = useState(false);
  const [viewMode, setViewMode] = useState<"cakes" | "shops">("cakes");

  // ✅ Fetch cakes and shops on page load
  useEffect(() => {
    dispatch(getCakes());
    dispatch(fetchActiveShops({ page: 1, limit: 6 }));
  }, [dispatch]);

  // ✅ Take only first 6 cakes for "Featured" section
  const featured = useMemo(() => cakes.slice(0, 6), [cakes]);

  const heroStats = useMemo(
    () => [
      { value: cakes.length || "--", label: "Cakes listed" },
      { value: shops.length || "--", label: "Active shops" },
      { value: "4.9/5", label: "Average rating" },
      { value: "52K+", label: "Happy deliveries" },
    ],
    [cakes.length, shops.length]
  );

  const benefits = [
    {
      icon: ShieldCheck,
      title: "Verified bakers",
      desc: "Every shop is curated to meet our quality standards.",
    },
    {
      icon: Sparkles,
      title: "Freshly baked",
      desc: "Daily baking runs keep every cake moist and bright.",
    },
    {
      icon: ThumbsUp,
      title: "Customer love",
      desc: "4.9+ rating from thousands of dessert lovers.",
    },
    {
      icon: Award,
      title: "Celebration ready",
      desc: "Customizable cakes for every milestone.",
    },
  ];

  const testimonials = [
    {
      quote:
        "CakeHaven made our anniversary unforgettable. Fast delivery and the cake tasted as good as it looked!",
      author: "Priya & Aman",
      role: "Bengaluru",
    },
    {
      quote:
        "The curated bakeries, transparent pricing, and friendly chat support keep me coming back for birthdays.",
      author: "Rahul Sharma",
      role: "Delhi",
    },
  ];
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
                  Explore Bakeries
                </Button>
              </Link>
            </div>

            {/* View Mode Toggle */}
            <div className="mt-6 p-4 rounded-2xl border bg-card/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Store className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-semibold">View Mode</div>
                    <div className="text-sm text-muted-foreground">
                      {viewMode === "cakes" ? "Showing cake gallery" : "Showing shop directory"}
                    </div>
                  </div>
                </div>
                <div className="inline-flex rounded-md p-1 bg-secondary text-sm">
                  {(["cakes", "shops"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={cn(
                        "px-3 py-1.5 rounded-md capitalize",
                        viewMode === mode
                          ? "bg-background shadow text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Shop Toggle Section */}
            <div className="mt-8 p-4 rounded-2xl border bg-card/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Store className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-semibold">Shop Mode</div>
                    <div className="text-sm text-muted-foreground">
                      {shopEnabled ? "Shop features are enabled" : "Shop features are disabled"}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShopEnabled(!shopEnabled)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-background hover:bg-muted transition-colors"
                >
                  {shopEnabled ? (
                    <ToggleRight className="w-5 h-5 text-green-600" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-gray-400" />
                  )}
                  <span className="text-sm font-medium">
                    {shopEnabled ? "ON" : "OFF"}
                  </span>
                </button>
              </div>
              
              {shopEnabled && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Show shop information</span>
                    <button
                      onClick={() => setShowShopInfo(!showShopInfo)}
                      className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      {showShopInfo ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              )}
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

      {/* Hero Stats */}
      <section className="container mx-auto py-8 md:py-12">
        {/* Shop Information Display */}
        {shopEnabled && showShopInfo && (
          <div className="mb-8 p-6 rounded-3xl border bg-gradient-to-r from-primary/5 to-rose-500/5">
            <div className="flex items-center gap-4 mb-4">
              <Store className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold">Featured Shop</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl border-2 border-border overflow-hidden bg-muted/30">
                  <img
                    src="/images/default-shop-logo.png"
                    alt="Shop logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold">Sweet Dreams Bakery</h4>
                  <p className="text-sm text-muted-foreground">Premium cakes & pastries</p>
                  <div className="flex items-center gap-1 mt-1">
                    <RatingStars rating={4.9} className="flex" />
                    <span className="text-sm">4.9</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border bg-card/50">
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div className="font-semibold text-green-600">Open Now</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Delivery</div>
                  <div className="font-semibold">30-45 min</div>
                </div>
                <Link href="/shops/1">
                  <Button size="sm" className="rounded-lg">
                    View Shop
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {heroStats.map((stat) => (
            <article
              key={stat.label}
              className="rounded-2xl border bg-card/70 p-4 text-center shadow-sm"
            >
              <div className="text-2xl font-extrabold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </article>
          ))}
        </div>
      </section>

      {/* Benefits Highlights */}
      <section className="container mx-auto py-8 md:py-12">
        <SectionHeading
          title="Why CakeHaven"
          subtitle="A curated celebration experience from discovery to delivery"
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border bg-background/80 p-5 text-center shadow"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <item.icon size={20} />
              </div>
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto py-8 md:py-12">
        <SectionHeading
          title="Celebrations all around"
          subtitle="Stories from bakers and dessert lovers who've trusted CakeHaven"
        />
        <div className="grid sm:grid-cols-2 gap-6">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.author}
              className="rounded-3xl border bg-gradient-to-br from-white via-primary/10 to-background/80 p-6 shadow-xl"
            >
              <p className="text-lg italic leading-relaxed">“{testimonial.quote}”</p>
              <div className="mt-4 text-sm font-semibold">{testimonial.author}</div>
              <div className="text-xs text-muted-foreground">{testimonial.role}</div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto my-12 rounded-3xl bg-gradient-to-r from-primary to-rose-500 p-8 shadow-2xl text-white">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wider opacity-80">Ready to celebrate?</p>
            <h3 className="text-3xl font-bold">Browse curated cakes and place your order in minutes.</h3>
            <p className="mt-2 text-white/80">
              Select from top bakers, chat for personalization, and get doorstep delivery.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="#featured">
              <Button className="rounded-full px-6 py-3">View Cakes</Button>
            </Link>
            <Link href="/shops">
              <Button variant="outline" className="rounded-full px-6 py-3 text-white border-white">
                Explore Bakeries
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section id="featured" className="container mx-auto py-12 md:py-16">
        <SectionHeading
          title={viewMode === "cakes" ? "Featured Cakes" : "Featured Shops"}
          subtitle={viewMode === "cakes" ? "Popular picks from our community" : "Discover local bakeries and their specialties"}
        />

        {!shopEnabled && viewMode === "cakes" ? (
          <div className="text-center py-12">
            <Store className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Shop Mode is Disabled</h3>
            <p className="text-muted-foreground mb-6">
              Enable shop mode to browse and order cakes from our featured bakeries.
            </p>
            <Button onClick={() => setShopEnabled(true)} className="rounded-xl">
              Enable Shop Mode
            </Button>
          </div>
        ) : viewMode === "shops" ? (
          shopsLoading ? (
            <p>Loading shops...</p>
          ) : shopsError ? (
            <p className="text-red-500">Error: {shopsError}</p>
          ) : shops.length === 0 ? (
            <p>No shops available.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {shops.map((shop) => (
                <Link key={shop.id} href={`/shops/${shop.id}`}>
                  <div
                    className="group rounded-2xl overflow-hidden border bg-card shadow-sm hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="relative">
                      <div className="h-52 w-full bg-gradient-to-br from-primary/10 to-rose-500/10">
                        {shop.logo ? (
                          <img
                            src={shop.logo}
                            alt={shop.shopname}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Store className="w-12 h-12 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3 bg-background/90 backdrop-blur px-2 py-1 rounded-md text-xs font-semibold ring-1 ring-border">
                          {shop.status === "active" ? "Open Now" : "Closed"}
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-lg group-hover:text-primary transition-colors">
                            {shop.shopname}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {shop.ownername}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <MapPin className="w-4 h-4" />
                            <span>{shop.city}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span>4.8</span>
                            <span>(23 reviews)</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" className="mt-3 w-full">
                        View Shop Cakes
                      </Button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : loading ? (
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
