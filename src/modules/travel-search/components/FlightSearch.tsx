/**
 * PATCH 608: Flight Search Component
 * Multi-source flight search with AI recommendations
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plane, Search, ExternalLink, Sparkles, TrendingDown, Clock, AlertCircle } from 'lucide-react';
import { searchFlights, FlightOffer } from '@/services/skyscanner';
import { analyzeFlightOffers, FlightRecommendation } from '@/lib/travel/LLMFlightAdvisor';
import { generateAllFlightLinks } from '@/lib/travel/deepLinkBuilder';
import { useToast } from '@/hooks/use-toast';

export function FlightSearch() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    adults: 1,
    children: 0,
    cabinClass: 'economy' as const,
  });
  const [results, setResults] = useState<FlightOffer[]>([]);
  const [recommendation, setRecommendation] = useState<FlightRecommendation | null>(null);
  const [deepLinks, setDeepLinks] = useState<Record<string, string>>({});

  const handleSearch = async () => {
    if (!searchParams.origin || !searchParams.destination || !searchParams.departureDate) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in origin, destination, and departure date.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    try {
      // Search via Skyscanner API
      const skyscannerResult = await searchFlights(searchParams);
      
      if (skyscannerResult.success) {
        setResults(skyscannerResult.offers);
        
        // Generate AI recommendation
        const aiRecommendation = await analyzeFlightOffers(skyscannerResult.offers, {
          priorityPrice: true,
        });
        setRecommendation(aiRecommendation);
        
        // Generate deep links for alternative sources
        const links = generateAllFlightLinks(searchParams);
        setDeepLinks(links);
        
        toast({
          title: 'Search Complete',
          description: `Found ${skyscannerResult.offers.length} flight options${skyscannerResult.cached ? ' (from cache)' : ''}`,
        });
      } else {
        toast({
          title: 'Search Failed',
          description: skyscannerResult.error || 'Unable to search flights',
          variant: 'destructive',
        });
        
        // Still generate deep links as fallback
        const links = generateAllFlightLinks(searchParams);
        setDeepLinks(links);
      }
    } catch (error) {
      console.error('Flight search error:', error);
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
            <Plane className="h-5 w-5" />
            Flight Search
          </CardTitle>
          <CardDescription>
            Search for flights across multiple sources with AI-powered recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origin">Origin (IATA Code)</Label>
              <Input
                id="origin"
                placeholder="e.g., GRU"
                value={searchParams.origin}
                onChange={(e) => setSearchParams({ ...searchParams, origin: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination">Destination (IATA Code)</Label>
              <Input
                id="destination"
                placeholder="e.g., MRS"
                value={searchParams.destination}
                onChange={(e) => setSearchParams({ ...searchParams, destination: e.target.value.toUpperCase() })}
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
          </div>
          <Button onClick={handleSearch} disabled={loading} className="w-full">
            <Search className="h-4 w-4 mr-2" />
            {loading ? 'Searching...' : 'Search Flights'}
          </Button>
        </CardContent>
      </Card>

      {recommendation && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Sparkles className="h-5 w-5" />
              AI Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-blue-800">{recommendation.reasoning}</p>
            {recommendation.insights.length > 0 && (
              <div className="space-y-1">
                {recommendation.insights.map((insight, idx) => (
                  <div key={idx} className="text-sm text-blue-700 flex items-center gap-2">
                    <AlertCircle className="h-3 w-3" />
                    {insight}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="results" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="results">API Results</TabsTrigger>
          <TabsTrigger value="deeplinks">Alternative Sources</TabsTrigger>
        </TabsList>
        
        <TabsContent value="results" className="space-y-4">
          {results.length === 0 ? (
            <Alert>
              <AlertDescription>
                No results yet. Start a search to see flight options.
              </AlertDescription>
            </Alert>
          ) : (
            results.map((offer, idx) => (
              <Card key={offer.id || idx} className={offer.id === recommendation?.recommended?.id ? 'border-green-500 border-2' : ''}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{offer.airline}</h3>
                        {offer.id === recommendation?.recommended?.id && (
                          <Badge variant="default">Recommended</Badge>
                        )}
                        {offer.stops === 0 && <Badge variant="secondary">Direct</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {offer.duration} • {offer.stops} stop{offer.stops !== 1 ? 's' : ''}
                        </div>
                        <div>{offer.departureTime} → {offer.arrivalTime}</div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="text-2xl font-bold">
                        {offer.currency} {offer.price.toFixed(2)}
                      </div>
                      {offer.deepLink && (
                        <Button size="sm" asChild>
                          <a href={offer.deepLink} target="_blank" rel="noopener noreferrer">
                            Book <ExternalLink className="h-3 w-3 ml-1" />
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
              Search directly on these platforms for more options and potentially better deals.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(deepLinks).map(([provider, url]) => (
              <Card key={provider}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold capitalize">{provider.replace(/([A-Z])/g, ' $1').trim()}</h3>
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
