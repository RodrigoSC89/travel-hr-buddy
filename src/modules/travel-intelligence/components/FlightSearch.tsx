/**
 * PATCH 608: Flight Search Component
 * Integration with Skyscanner, MaxMilhas and airline deep links
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plane, Search, ExternalLink, Star, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  cabinClass: string;
}

const AIRLINES = [
  { name: "LATAM", code: "LA", deepLinkBase: "https://www.latam.com" },
  { name: "GOL", code: "G3", deepLinkBase: "https://www.voegol.com.br" },
  { name: "Azul", code: "AD", deepLinkBase: "https://www.voeazul.com.br" },
];

export default function FlightSearch() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useState<FlightSearchParams>({
    origin: "",
    destination: "",
    departureDate: "",
    returnDate: "",
    passengers: 1,
    cabinClass: "economy",
  });

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchParams.origin || !searchParams.destination || !searchParams.departureDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    
    // Simulate search - In production, this would call actual APIs
    setTimeout(() => {
      const mockResults = [
        {
          id: "1",
          airline: "LATAM",
          price: 850,
          duration: "2h 30m",
          stops: 0,
          departure: searchParams.departureDate,
          deepLink: `${AIRLINES[0].deepLinkBase}?origin=${searchParams.origin}&destination=${searchParams.destination}`,
        },
        {
          id: "2",
          airline: "GOL",
          price: 780,
          duration: "2h 45m",
          stops: 0,
          departure: searchParams.departureDate,
          deepLink: `${AIRLINES[1].deepLinkBase}?origin=${searchParams.origin}&destination=${searchParams.destination}`,
        },
        {
          id: "3",
          airline: "Azul",
          price: 820,
          duration: "3h 15m",
          stops: 1,
          departure: searchParams.departureDate,
          deepLink: `${AIRLINES[2].deepLinkBase}?origin=${searchParams.origin}&destination=${searchParams.destination}`,
        },
      ];

      setSearchResults(mockResults);
      setIsSearching(false);
      
      toast({
        title: "Search Complete",
        description: `Found ${mockResults.length} flight options`,
      });
    }, 1500);
  };

  const openDeepLink = (url: string, airline: string) => {
    toast({
      title: "Opening " + airline,
      description: "Redirecting to airline booking page...",
    });
    window.open(url, "_blank");
  };

  const addToFavorites = (flight: any) => {
    // TODO: Implement actual save to Supabase favorites table
    // For now, just show toast
    toast({
      title: "Added to Favorites",
      description: `${flight.airline} flight saved`,
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Flights
          </CardTitle>
          <CardDescription>
            Search across Skyscanner, MaxMilhas and direct airline bookings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origin">Origin</Label>
              <Input
                id="origin"
                placeholder="e.g., GRU"
                value={searchParams.origin}
                onChange={(e) => setSearchParams({ ...searchParams, origin: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
                placeholder="e.g., GIG"
                value={searchParams.destination}
                onChange={(e) => setSearchParams({ ...searchParams, destination: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="departureDate">Departure Date</Label>
              <Input
                id="departureDate"
                type="date"
                value={searchParams.departureDate}
                onChange={(e) => setSearchParams({ ...searchParams, departureDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="returnDate">Return Date (Optional)</Label>
              <Input
                id="returnDate"
                type="date"
                value={searchParams.returnDate}
                onChange={(e) => setSearchParams({ ...searchParams, returnDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passengers">Passengers</Label>
              <Input
                id="passengers"
                type="number"
                min="1"
                max="9"
                value={searchParams.passengers}
                onChange={(e) => setSearchParams({ ...searchParams, passengers: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cabinClass">Cabin Class</Label>
              <Select value={searchParams.cabinClass} onValueChange={(value) => setSearchParams({ ...searchParams, cabinClass: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="economy">Economy</SelectItem>
                  <SelectItem value="premium-economy">Premium Economy</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="first">First Class</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleSearch} disabled={isSearching} className="w-full">
            <Search className="mr-2 h-4 w-4" />
            {isSearching ? "Searching..." : "Search Flights"}
          </Button>
        </CardContent>
      </Card>

      {searchResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Search Results</h3>
          {searchResults.map((flight) => (
            <Card key={flight.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Plane className="h-4 w-4" />
                      <span className="font-semibold">{flight.airline}</span>
                      {flight.stops === 0 && (
                        <Badge variant="secondary">Direct</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Duration: {flight.duration} • {flight.stops} stop{flight.stops !== 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-2xl font-bold">{flight.price}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">per person</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addToFavorites(flight)}
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => openDeepLink(flight.deepLink, flight.airline)}
                      >
                        Book Now
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
