/**
 * PATCH 608: Hotel Search Component
 * Integration with Booking.com and hotel search engines
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Hotel, Search, ExternalLink, Star, MapPin, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HotelSearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
}

export default function HotelSearch() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useState<HotelSearchParams>({
    destination: "",
    checkIn: "",
    checkOut: "",
    guests: 1,
    rooms: 1,
  });

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchParams.destination || !searchParams.checkIn || !searchParams.checkOut) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    
    // Simulate search - In production, this would call Booking.com API
    setTimeout(() => {
      const mockResults = [
        {
          id: "1",
          name: "Copacabana Palace",
          location: "Rio de Janeiro",
          rating: 5,
          price: 450,
          amenities: ["Pool", "Spa", "Beach Access"],
          image: "https://images.unsplash.com/photo-1566073771259-6a8506099945",
        },
        {
          id: "2",
          name: "Hotel Unique",
          location: "São Paulo",
          rating: 4.5,
          price: 380,
          amenities: ["Rooftop Bar", "Gym", "Restaurant"],
          image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa",
        },
        {
          id: "3",
          name: "Fasano Salvador",
          location: "Salvador",
          rating: 4.8,
          price: 420,
          amenities: ["Beach View", "Pool", "Spa"],
          image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b",
        },
      ];

      setSearchResults(mockResults);
      setIsSearching(false);
      
      toast({
        title: "Search Complete",
        description: `Found ${mockResults.length} hotel options`,
      });
    }, 1500);
  };

  const openBookingLink = (hotel: any) => {
    const bookingUrl = `https://www.booking.com/search?ss=${encodeURIComponent(hotel.location)}`;
    toast({
      title: "Opening Booking.com",
      description: `Viewing ${hotel.name}...`,
    });
    window.open(bookingUrl, "_blank");
  };

  const addToFavorites = (hotel: any) => {
    // TODO: Implement actual save to Supabase favorites table
    // For now, just show toast
    toast({
      title: "Added to Favorites",
      description: `${hotel.name} saved`,
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Hotels
          </CardTitle>
          <CardDescription>
            Find the best hotel deals with Booking.com integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hotelDestination">Destination</Label>
              <Input
                id="hotelDestination"
                placeholder="City or hotel name"
                value={searchParams.destination}
                onChange={(e) => setSearchParams({ ...searchParams, destination: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="checkIn">Check-in Date</Label>
              <Input
                id="checkIn"
                type="date"
                value={searchParams.checkIn}
                onChange={(e) => setSearchParams({ ...searchParams, checkIn: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkOut">Check-out Date</Label>
              <Input
                id="checkOut"
                type="date"
                value={searchParams.checkOut}
                onChange={(e) => setSearchParams({ ...searchParams, checkOut: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hotelGuests">Guests</Label>
              <Input
                id="hotelGuests"
                type="number"
                min="1"
                max="10"
                value={searchParams.guests}
                onChange={(e) => setSearchParams({ ...searchParams, guests: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rooms">Rooms</Label>
              <Input
                id="rooms"
                type="number"
                min="1"
                max="5"
                value={searchParams.rooms}
                onChange={(e) => setSearchParams({ ...searchParams, rooms: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <Button onClick={handleSearch} disabled={isSearching} className="w-full">
            <Search className="mr-2 h-4 w-4" />
            {isSearching ? "Searching..." : "Search Hotels"}
          </Button>
        </CardContent>
      </Card>

      {searchResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {searchResults.map((hotel) => (
            <Card key={hotel.id} className="overflow-hidden">
              <div className="h-48 bg-muted relative">
                <img 
                  src={hotel.image} 
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => addToFavorites(hotel)}
                >
                  <Star className="h-4 w-4" />
                </Button>
              </div>
              <CardContent className="pt-4 space-y-2">
                <div>
                  <h3 className="font-semibold text-lg">{hotel.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {hotel.location}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.floor(hotel.rating) }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm ml-1">{hotel.rating}</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {hotel.amenities.map((amenity: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-5 w-5" />
                    <span className="text-2xl font-bold">{hotel.price}</span>
                    <span className="text-sm text-muted-foreground">/night</span>
                  </div>
                  <Button size="sm" onClick={() => openBookingLink(hotel)}>
                    Book
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
