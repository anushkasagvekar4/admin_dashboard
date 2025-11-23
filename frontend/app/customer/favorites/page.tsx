"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { AppDispatch, RootState } from "@/app/store/Store";
import { fetchCart, addToCartAPI } from "@/app/features/orders/cartApi";
import { toast } from "sonner";

interface FavoriteItem {
  id: string;
  cakeId: string;
  cake_name: string;
  price: number;
  image: string;
  added_at: string;
}

export default function FavoritesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  useEffect(() => {
    // Load favorites from localStorage (in a real app, this would be from API)
    const storedFavorites = localStorage.getItem(`favorites_${user || 'guest'}`);
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
    setLoadingFavorites(false);
  }, [user]);

  const removeFromFavorites = (cakeId: string) => {
    const updatedFavorites = favorites.filter(fav => fav.cakeId !== cakeId);
    setFavorites(updatedFavorites);
    localStorage.setItem(`favorites_${user || 'guest'}`, JSON.stringify(updatedFavorites));
    toast.success("Removed from favorites");
  };

  const addToCart = (favorite: FavoriteItem) => {
    // Check if item is already in cart
    const existingItem = items.find(item => item.cakeId === favorite.cakeId);
    
    if (existingItem) {
      toast.error("This item is already in your cart");
      return;
    }

    // Add to cart
    const cartItem = {
      id: `temp_${Date.now()}`, // Temporary ID
      cakeId: favorite.cakeId,
      cake_name: favorite.cake_name,
      price: favorite.price,
      image: favorite.image,
      quantity: 1,
    };

    dispatch(addToCartAPI(cartItem));
    toast.success("Added to cart!");
  };

  if (loadingFavorites) {
    return (
      <div className="p-6 text-center">
        <p>Loading favorites...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">My Favorites</h1>
        <p className="text-gray-600">
          Items you've saved for later
        </p>
      </div>

      {favorites.length === 0 ? (
        <Card className="text-center p-8">
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <Heart className="w-16 h-16 text-gray-300" />
              <div>
                <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
                <p className="text-gray-600 mb-4">
                  Start adding items to your favorites to see them here
                </p>
                <Button 
                  onClick={() => window.location.href = "/customer/home"}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Browse Cakes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => (
            <Card key={favorite.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="relative">
                  <img
                    src={favorite.image}
                    alt={favorite.cake_name}
                    className="w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.png";
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                    onClick={() => removeFromFavorites(favorite.cakeId)}
                  >
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-lg mb-2">{favorite.cake_name}</CardTitle>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-bold text-blue-600">
                    ₹{favorite.price.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500">
                    Added {new Date(favorite.added_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => addToCart(favorite)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600"
                    disabled={loading}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {loading ? "Adding..." : "Add to Cart"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
