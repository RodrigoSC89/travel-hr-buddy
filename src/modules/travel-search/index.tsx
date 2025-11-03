/**
 * PATCH 608: Travel Search Module
 * Intelligent travel search with multi-source comparison
 */

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plane, Hotel } from 'lucide-react';
import { FlightSearch } from './components/FlightSearch';
import { HotelSearch } from './components/HotelSearch';

export function TravelSearch() {
  return (
    <div className="container mx-auto py-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Travel Intelligence Search</CardTitle>
          <CardDescription>
            Search for flights and hotels with AI-powered recommendations across multiple sources
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="flights" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="flights" className="flex items-center gap-2">
            <Plane className="h-4 w-4" />
            Flights
          </TabsTrigger>
          <TabsTrigger value="hotels" className="flex items-center gap-2">
            <Hotel className="h-4 w-4" />
            Hotels
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="flights">
          <FlightSearch />
        </TabsContent>
        
        <TabsContent value="hotels">
          <HotelSearch />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default TravelSearch;
