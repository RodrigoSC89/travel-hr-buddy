import React, { useState } from 'react';
import { VesselTrackingMap } from '@/components/fleet/VesselTrackingMap';
import { GeofencingTab } from '@/components/fleet/GeofencingTab';
import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Map, Shield } from "lucide-react";

export default function VesselTrackingPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="p-6 space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-3xl font-bold">Rastreamento de Embarcações</h1>
        <p className="text-muted-foreground mt-1">
          Posições AIS em tempo real com Geofencing inteligente
        </p>
      </motion.div>
      
      <motion.div variants={fadeUp}>
        <Tabs defaultValue="map" className="space-y-4">
          <TabsList>
            <TabsTrigger value="map" className="gap-2"><Map className="h-4 w-4" />Mapa AIS</TabsTrigger>
            <TabsTrigger value="geofencing" className="gap-2"><Shield className="h-4 w-4" />Geofencing</TabsTrigger>
          </TabsList>
          <TabsContent value="map">
            <VesselTrackingMap autoRefresh refreshInterval={60000} />
          </TabsContent>
          <TabsContent value="geofencing">
            <GeofencingTab />
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
