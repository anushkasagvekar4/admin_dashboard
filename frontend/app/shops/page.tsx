"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchActiveShops } from "@/app/features/shops/shopsApi";
import { AppDispatch, RootState } from "@/app/store/Store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, Clock, Store } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ShopsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { shops, loading, error, pagination } = useSelector(
    (state: RootState) => state.publicShops
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [currentPage, setCurrentPage] = useState(1);

  // Extract unique cities from shops
  const cities = [...new Set(shops.map(shop => shop.city).filter(Boolean))];

  useEffect(() => {
    dispatch(
      fetchActiveShops({
        page: currentPage,
        limit: 12,
        search: searchTerm,
        city: selectedCity,
        sortBy,
        sortOrder: "desc",
      })
    );
  }, [dispatch, currentPage, searchTerm, selectedCity, sortBy]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city === "all" ? "" : city);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading && shops.length === 0) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center">
          <Store className="w-16 h-16 mx-auto text-muted-foreground animate-pulse" />
          <p className="mt-4 text-muted-foreground">Loading shops...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center">
          <p className="text-red-500">Error: {error}</p>
          <Button onClick={() => dispatch(fetchActiveShops({}))} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Browse Bakeries</h1>
        <p className="text-muted-foreground">
          Discover local bakeries and their delicious cake collections
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search shops by name or owner..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* City Filter */}
          <Select value={selectedCity} onValueChange={handleCityChange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Newest First</SelectItem>
              <SelectItem value="shopname">Name (A-Z)</SelectItem>
              <SelectItem value="city">City</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Shops Grid */}
      {shops.length === 0 && !loading ? (
        <div className="text-center py-12">
          <Store className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No shops found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filters
          </p>
          <Button onClick={() => {
            setSearchTerm("");
            setSelectedCity("all");
            setCurrentPage(1);
          }}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {shops.map((shop) => (
              <Link key={shop.id} href={`/shops/${shop.id}`}>
                <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden">
                  <CardContent className="p-0">
                    {/* Shop Logo/Image */}
                    <div className="relative h-48 bg-gradient-to-br from-primary/10 to-rose-500/10">
                      {shop.logo ? (
                        <Image
                          src={shop.logo}
                          alt={shop.shopname}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Store className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <Badge variant={shop.status === "active" ? "default" : "secondary"}>
                          {shop.status === "active" ? "Open" : "Closed"}
                        </Badge>
                      </div>
                    </div>

                    {/* Shop Info */}
                    <div className="p-4">
                      <div className="mb-2">
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          {shop.shopname}
                        </h3>
                        <p className="text-sm text-muted-foreground">{shop.ownername}</p>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{shop.city}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>Usually available</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span>4.8</span>
                          <span className="text-muted-foreground">(23 reviews)</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">View cakes</span>
                          <Button size="sm" variant="outline" className="rounded-lg">
                            Visit Shop
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
