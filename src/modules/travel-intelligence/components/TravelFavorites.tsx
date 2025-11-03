/**
 * PATCH 608: Travel Favorites Component
 * Manage favorite flights and hotels
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Plane, Hotel, Trash2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Favorite {
  id: string;
  type: "flight" | "hotel";
  title: string;
  description: string;
  price: number;
  link: string;
}

export default function TravelFavorites() {
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  useEffect(() => {
    // Mock data - In production, fetch from Supabase
    const mockFavorites: Favorite[] = [
      {
        id: "1",
        type: "flight",
        title: "GRU → GIG - LATAM",
        description: "Direct flight, 2h 30m",
        price: 850,
        link: "https://www.latam.com",
      },
      {
        id: "2",
        type: "hotel",
        title: "Copacabana Palace",
        description: "5-star beachfront resort",
        price: 450,
        link: "https://www.booking.com",
      },
    ];
    setFavorites(mockFavorites);
  }, []);

  const removeFavorite = (id: string, title: string) => {
    setFavorites(favorites.filter((fav) => fav.id !== id));
    toast({
      title: "Removed from Favorites",
      description: `${title} has been removed`,
    });
  };

  const openLink = (link: string) => {
    window.open(link, "_blank");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Your Favorites
          </CardTitle>
          <CardDescription>
            Quick access to your saved flights and hotels
          </CardDescription>
        </CardHeader>
      </Card>

      {favorites.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <Star className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No favorites yet</p>
            <p className="text-sm">Start adding your favorite flights and hotels!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favorites.map((favorite) => (
            <Card key={favorite.id}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        {favorite.type === "flight" ? (
                          <Plane className="h-4 w-4" />
                        ) : (
                          <Hotel className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{favorite.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {favorite.description}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-lg font-bold">${favorite.price}</span>
                          <span className="text-sm text-muted-foreground">
                            {favorite.type === "hotel" ? "/night" : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFavorite(favorite.id, favorite.title)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <Button
                    className="w-full"
                    size="sm"
                    onClick={() => openLink(favorite.link)}
                  >
                    View Details
                    <ExternalLink className="ml-2 h-4 w-4" />
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
