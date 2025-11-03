/**
 * PATCH 608: Travel Intelligence Module
 * Flight and hotel search with AI recommendations
 */

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FlightSearch from "./components/FlightSearch";
import HotelSearch from "./components/HotelSearch";
import TravelRecommendations from "./components/TravelRecommendations";
import BookingHistory from "./components/BookingHistory";
import TravelFavorites from "./components/TravelFavorites";
import { Plane, Hotel, Sparkles, History, Star } from "lucide-react";

export default function TravelIntelligence() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6" />
            Travel Intelligence
          </CardTitle>
          <CardDescription>
            PATCH 608 - Smart travel planning with AI-powered recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="search" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="search" className="flex items-center gap-2">
                <Plane className="h-4 w-4" />
                Flights
              </TabsTrigger>
              <TabsTrigger value="hotels" className="flex items-center gap-2">
                <Hotel className="h-4 w-4" />
                Hotels
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI Recommendations
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                History
              </TabsTrigger>
              <TabsTrigger value="favorites" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Favorites
              </TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="space-y-4">
              <FlightSearch />
            </TabsContent>

            <TabsContent value="hotels" className="space-y-4">
              <HotelSearch />
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              <TravelRecommendations />
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <BookingHistory />
            </TabsContent>

            <TabsContent value="favorites" className="space-y-4">
              <TravelFavorites />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
