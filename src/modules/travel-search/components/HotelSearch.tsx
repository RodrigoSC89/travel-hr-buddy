/**
 * PATCH 608: Hotel Search Component
 * Multi-source hotel search with deep links
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Hotel, Search, ExternalLink, Star, MapPin } from 'lucide-react';
import { searchHotels, HotelOffer } from '@/services/booking';
import { generateAllHotelLinks } from '@/lib/travel/deepLinkBuilder';
import { useToast } from '@/hooks/use-toast';

export function HotelSearch() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    destination: '',
    checkIn: '',
    checkOut: '',
    adults: 2,
    children: 0,
    rooms: 1,
  });
  const [results, setResults] = useState<HotelOffer[]>([]);
  const [deepLinks, setDeepLinks] = useState<Record<string, string>>({});

  const handleSearch = async () => {
    if (!searchParams.destination || !searchParams.checkIn || !searchParams.checkOut) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in destination, check-in, and check-out dates.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    try {
      // Search via Booking.com API
      const bookingResult = await searchHotels(searchParams);
      
      if (bookingResult.success) {
        setResults(bookingResult.offers);
        
        toast({
          title: 'Search Complete',
          description: `Found ${bookingResult.offers.length} hotel options${bookingResult.cached ? ' (from cache)' : ''}`,
        });
      } else {
        toast({
          title: 'Search Failed',
          description: bookingResult.error || 'Unable to search hotels',
          variant: 'destructive',
        });
      }
      
      // Generate deep links for alternative sources
      const links = generateAllHotelLinks(searchParams);
      setDeepLinks(links);
    } catch (error) {
      console.error('Hotel search error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hotel className="h-5 w-5" />
            Hotel Search
          </CardTitle>
          <CardDescription>
            Search for hotels across multiple booking platforms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
                placeholder="e.g., Paris, France"
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
              <Label htmlFor="adults">Adults</Label>
              <Input
                id="adults"
                type="number"
                min="1"
                value={searchParams.adults}
                onChange={(e) => setSearchParams({ ...searchParams, adults: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="children">Children</Label>
              <Input
                id="children"
                type="number"
                min="0"
                value={searchParams.children}
                onChange={(e) => setSearchParams({ ...searchParams, children: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rooms">Rooms</Label>
              <Input
                id="rooms"
                type="number"
                min="1"
                value={searchParams.rooms}
                onChange={(e) => setSearchParams({ ...searchParams, rooms: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <Button onClick={handleSearch} disabled={loading} className="w-full">
            <Search className="h-4 w-4 mr-2" />
            {loading ? 'Searching...' : 'Search Hotels'}
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="results" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="results">API Results</TabsTrigger>
          <TabsTrigger value="deeplinks">Alternative Sources</TabsTrigger>
        </TabsList>
        
        <TabsContent value="results" className="space-y-4">
          {results.length === 0 ? (
            <Alert>
              <AlertDescription>
                No results yet. Start a search to see hotel options.
              </AlertDescription>
            </Alert>
          ) : (
            results.map((hotel, idx) => (
              <Card key={hotel.id || idx}>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    {hotel.imageUrl && (
                      <img 
                        src={hotel.imageUrl} 
                        alt={hotel.name}
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{hotel.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {hotel.location}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            {hotel.currency} {hotel.price.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">per night</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {hotel.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{hotel.rating}</span>
                          </div>
                        )}
                        {hotel.reviewScore && (
                          <Badge variant="secondary">
                            {hotel.reviewScore.toFixed(1)} / 10
                          </Badge>
                        )}
                      </div>
                      {hotel.deepLink && (
                        <Button size="sm" asChild>
                          <a href={hotel.deepLink} target="_blank" rel="noopener noreferrer">
                            View Details <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="deeplinks" className="space-y-4">
          <Alert>
            <AlertDescription>
              Search directly on these platforms for more options and deals.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(deepLinks).map(([provider, url]) => (
              <Card key={provider}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold capitalize">{provider}</h3>
                    <Button size="sm" asChild>
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        Open <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
