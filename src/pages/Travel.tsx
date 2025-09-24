import React from 'react';
import { FlightSearch } from '@/components/travel/flight-search';
import { HotelSearch } from '@/components/travel/hotel-search';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plane, Building, Map, Calendar } from 'lucide-react';
import VoiceInterface from '@/components/voice/VoiceInterface';

const Travel = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-lg bg-primary/10">
              <Plane className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Viagens</h1>
              <p className="text-muted-foreground">
                Planeje e gerencie suas viagens corporativas
              </p>
            </div>
          </div>

          <Tabs defaultValue="flights" className="space-y-6">
            <TabsList className="grid grid-cols-4 w-full max-w-lg">
              <TabsTrigger value="flights" className="flex items-center gap-2">
                <Plane className="h-4 w-4" />
                Voos
              </TabsTrigger>
              <TabsTrigger value="hotels" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Hotéis
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-2">
                <Map className="h-4 w-4" />
                Mapa
              </TabsTrigger>
              <TabsTrigger value="itinerary" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Roteiro
              </TabsTrigger>
            </TabsList>

            <TabsContent value="flights">
              <FlightSearch />
            </TabsContent>

            <TabsContent value="hotels">
              <HotelSearch />
            </TabsContent>

            <TabsContent value="map">
              <Card>
                <CardHeader>
                  <CardTitle>Mapa de Viagens</CardTitle>
                  <CardDescription>
                    Visualize destinos e rotas no mapa interativo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Map className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Mapa interativo</h3>
                    <p className="text-muted-foreground">
                      Funcionalidade de mapa será disponibilizada em breve
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="itinerary">
              <Card>
                <CardHeader>
                  <CardTitle>Roteiros de Viagem</CardTitle>
                  <CardDescription>
                    Gerencie seus itinerários e compromissos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Roteiros em desenvolvimento</h3>
                    <p className="text-muted-foreground">
                      Funcionalidade de roteiros será disponibilizada em breve
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
        <VoiceInterface />
      </div>
    </SidebarProvider>
  );
};

export default Travel;