"use client";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { fetchShopWithCakes } from "@/app/features/shops/shopsApi";
import { AppDispatch, RootState } from "@/app/store/Store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Star, 
  ArrowLeft, 
  ShoppingBag,
  Store,
  CheckCircle
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { RatingStars } from "@/app/Home/RatingStars";

export default function ShopDetailPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const params = useParams();
  const shopId = params.id as string;

  const { currentShop, shopCakes, loading, error } = useSelector(
    (state: RootState) => state.publicShops
  );

  useEffect(() => {
    if (shopId) {
      dispatch(fetchShopWithCakes(shopId));
    }
  }, [dispatch, shopId]);

  const handleAddToCart = async (cake: any) => {
    // This would integrate with your existing cart functionality
    console.log("Adding to cart:", cake);
    // You can call your existing addToCartAPI here
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center">
          <Store className="w-16 h-16 mx-auto text-muted-foreground animate-pulse" />
          <p className="mt-4 text-muted-foreground">Loading shop details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center">
          <p className="text-red-500">Error: {error}</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!currentShop) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center">
          <Store className="w-16 h-16 mx-auto text-muted-foreground" />
          <h3 className="text-xl font-semibold mt-4 mb-2">Shop not found</h3>
          <p className="text-muted-foreground mb-4">
            The shop you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/shops">
            <Button>Browse All Shops</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Shops
      </Button>

      {/* Shop Header */}
      <div className="bg-gradient-to-r from-primary/5 to-rose-500/5 rounded-3xl p-8 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shop Logo */}
          <div className="flex justify-center lg:justify-start">
            <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-white">
              {currentShop.logo ? (
                <Image
                  src={currentShop.logo}
                  alt={currentShop.shopname}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <Store className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          {/* Shop Info */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{currentShop.shopname}</h1>
                <Badge variant={currentShop.status === "active" ? "default" : "secondary"}>
                  {currentShop.status === "active" ? "Open Now" : "Closed"}
                </Badge>
              </div>
              <p className="text-lg text-muted-foreground">{currentShop.ownername}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{currentShop.city}</p>
                  <p className="text-sm text-muted-foreground">{currentShop.address}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <p className="font-medium">{currentShop.phone}</p>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <p className="font-medium">{currentShop.email}</p>
              </div>

              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <div>
                  <p className="font-medium">4.8 Rating</p>
                  <p className="text-sm text-muted-foreground">Based on 23 reviews</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Verified Bakery</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-5 h-5" />
                <span>Usually responds within 2 hours</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cakes Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Available Cakes</h2>
            <p className="text-muted-foreground">
              {shopCakes.length} delicious cakes from {currentShop.shopname}
            </p>
          </div>
          <Badge variant="outline" className="px-3 py-1">
            <ShoppingBag className="w-4 h-4 mr-1" />
            {shopCakes.length} Items
          </Badge>
        </div>

        {shopCakes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No cakes available</h3>
              <p className="text-muted-foreground mb-4">
                This shop hasn't added any cakes yet.
              </p>
              <Link href="/shops">
                <Button variant="outline">Browse Other Shops</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {shopCakes.map((cake) => (
              <Card key={cake.id} className="group hover:shadow-lg transition-all duration-200">
                <CardContent className="p-0">
                  {/* Cake Image */}
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    {cake.images?.[0] ? (
                      <Image
                        src={cake.images[0]}
                        alt={cake.cake_name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/10 to-rose-500/10 flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-background/90 backdrop-blur px-2 py-1 rounded-md text-xs font-semibold ring-1 ring-border">
                      ₹{Number(cake.price).toFixed(2)}
                    </div>
                    {cake.available && (
                      <div className="absolute top-3 right-3">
                        <Badge variant="default" className="text-xs">
                          Available
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Cake Info */}
                  <div className="p-4">
                    <div className="mb-3">
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                        {cake.cake_name}
                      </h3>
                      {cake.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {cake.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <RatingStars rating={4.8} className="flex" />
                      <span className="text-sm text-muted-foreground">4.8</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-lg">₹{Number(cake.price).toFixed(2)}</p>
                        {cake.category && (
                          <p className="text-xs text-muted-foreground">{cake.category}</p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(cake)}
                        className="rounded-lg"
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
