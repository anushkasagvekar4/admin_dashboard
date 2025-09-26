import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./SectionHeading";
import { RatingStars } from "./RatingStars";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, CreditCard, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface HomeProps {
  onAddToCart?: () => void;
}

const categories = [
  {
    name: "Chocolate",
    image:
      "https://images.unsplash.com/photo-1599785209796-9e2cb5f3a66f?w=400&auto=format&fit=crop&q=60",
  },
  {
    name: "Vanilla",
    image:
      "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=400&auto=format&fit=crop&q=60",
  },
  {
    name: "Red Velvet",
    image:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476e?w=400&auto=format&fit=crop&q=60",
  },
  {
    name: "Cheesecake",
    image:
      "https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?w=400&auto=format&fit=crop&q=60",
  },
  {
    name: "Fruit",
    image:
      "https://images.unsplash.com/photo-1541976076758-347942db1970?w=400&auto=format&fit=crop&q=60",
  },
  {
    name: "Black Forest",
    image:
      "https://images.unsplash.com/photo-1614704083784-8912c77f12f1?w=400&auto=format&fit=crop&q=60",
  },
];

const shops = [
  {
    slug: "sweet-bloom",
    name: "Sweet Bloom",
    rating: 4.8,
    logo: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=60",
  },
  {
    slug: "velvet-bakehouse",
    name: "Velvet Bakehouse",
    rating: 4.7,
    logo: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=200&auto=format&fit=crop&q=60",
  },
  {
    slug: "sugar-studio",
    name: "Sugar Studio",
    rating: 4.6,
    logo: "https://images.unsplash.com/photo-1519750783826-e2420f4d687f?w=200&auto=format&fit=crop&q=60",
  },
  {
    slug: "buttercup-bakery",
    name: "Buttercup Bakery",
    rating: 4.9,
    logo: "https://images.unsplash.com/photo-1519864790215-4ac7a045d4b8?w=200&auto=format&fit=crop&q=60",
  },
  {
    slug: "choco-factory",
    name: "Choco Factory",
    rating: 4.5,
    logo: "https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=200&auto=format&fit=crop&q=60",
  },
];

const cakes = [
  {
    id: "c1",
    name: "Classic Chocolate",
    price: 18.99,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476e?w=600&auto=format&fit=crop&q=60",
  },
  {
    id: "c2",
    name: "Vanilla Dream",
    price: 16.49,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=600&auto=format&fit=crop&q=60",
  },
  {
    id: "c3",
    name: "Red Velvet Delight",
    price: 21.0,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476e?w=600&auto=format&fit=crop&q=60",
  },
  {
    id: "c4",
    name: "Blueberry Cheesecake",
    price: 22.5,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?w=600&auto=format&fit=crop&q=60",
  },
  {
    id: "c5",
    name: "Fresh Fruit Cake",
    price: 19.99,
    rating: 4.4,
    image:
      "https://images.unsplash.com/photo-1541976076758-347942db1970?w=600&auto=format&fit=crop&q=60",
  },
  {
    id: "c6",
    name: "Black Forest",
    price: 20.99,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1614704083784-8912c77f12f1?w=600&auto=format&fit=crop&q=60",
  },
];

export default function Index({ onAddToCart }: HomeProps) {
  const router = useRouter();

  const featured = useMemo(() => cakes.slice(0, 6), []);

  return (
    <main>
      {/* Hero */}
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
            {/* <div className="hidden md:block absolute -bottom-6 -left-6 w-40 rounded-2xl overflow-hidden shadow-lg ring-1 ring-border">
              <img
                src="https://images.unsplash.com/photo-1519864790215-4ac7a045d4b8?w=600&auto=format&fit=crop&q=60"
                alt="Chocolate cake"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden md:block absolute -top-6 -right-6 w-40 rounded-2xl overflow-hidden shadow-lg ring-1 ring-border">
              <img
                src="https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?w=600&auto=format&fit=crop&q=60"
                alt="Cheesecake"
                className="w-full h-full object-cover"
              />
            </div> */}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto py-12 md:py-16">
        <SectionHeading
          title="Browse by Category"
          subtitle="From rich chocolate to creamy cheesecakes, find your perfect bite."
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((c) => (
            <button
              key={c.name}
              onClick={() =>
                router.push(
                  `/search?type=cakes&q=${encodeURIComponent(c.name)}`
                )
              }
              className="group relative rounded-2xl overflow-hidden shadow ring-1 ring-border hover:shadow-lg"
            >
              <img
                src={c.image}
                alt={c.name}
                className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-2 left-2 right-2 text-white font-semibold drop-shadow">
                {c.name}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Top Shops */}
      <section className="container mx-auto py-12 md:py-16">
        <SectionHeading
          title="Top Shops"
          subtitle="Highly rated bakeries near you"
        />
        <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none]">
          <div className="flex gap-4 min-w-max pr-4">
            {shops.map((s) => (
              <div
                key={s.slug}
                className="w-72 shrink-0 rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-5 flex items-center gap-3">
                  <img
                    src={s.logo}
                    alt={s.name}
                    className="size-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold">{s.name}</div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <RatingStars rating={s.rating} className="flex" />
                      <span>{s.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <div className="px-5 pb-5">
                  <Button
                    className="w-full"
                    variant="secondary"
                    onClick={() => router.push(`/shop/${s.slug}`)}
                  >
                    View Shop
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cakes */}
      <section id="featured" className="container mx-auto py-12 md:py-16">
        <SectionHeading
          title="Featured Cakes"
          subtitle="Popular picks from our community"
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((c) => (
            <div
              key={c.id}
              className="group rounded-2xl overflow-hidden border bg-card shadow-sm hover:shadow-md transition-all"
            >
              <div className="relative">
                <img
                  src={c.image}
                  alt={c.name}
                  className="h-52 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 bg-background/90 backdrop-blur px-2 py-1 rounded-md text-xs font-semibold ring-1 ring-border">
                  ${c.price.toFixed(2)}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{c.name}</div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <RatingStars rating={c.rating} className="flex" />
                      <span>{c.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <Button className="mt-3 w-full" onClick={() => onAddToCart?.()}>
                  Add to Cart
                </Button>
              </div>
            </div>
          ))}
        </div>
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
                {<s.icon />}
              </div>
              <div className="font-semibold">
                {i + 1}. {s.title}
              </div>
              <div className="text-sm text-muted-foreground mt-1">{s.desc}</div>
            </li>
          ))}
        </ol>
      </section>

      {/* Reviews */}
      <section className="container mx-auto py-12 md:py-16">
        <SectionHeading
          title="Latest Reviews"
          subtitle="What our customers are saying"
        />
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              name: "Aisha",
              rating: 5,
              comment:
                "The Red Velvet was heavenly! Delivery was quick and the presentation was gorgeous.",
              image: cakes[2].image,
            },
            {
              name: "Rahul",
              rating: 4.5,
              comment:
                "Loved the Chocolate cake. Moist, rich, and not overly sweet.",
              image: cakes[0].image,
            },
            {
              name: "Mia",
              rating: 4.8,
              comment:
                "Blueberry Cheesecake was perfect! Will order again for sure.",
              image: cakes[3].image,
            },
          ].map((r) => (
            <div
              key={r.name}
              className="rounded-2xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <img
                  src={r.image}
                  alt={r.name}
                  className="size-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold">{r.name}</div>
                  <RatingStars rating={r.rating} className="flex" />
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{r.comment}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
