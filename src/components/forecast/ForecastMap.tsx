/**
 * ForecastMap Component
 * Maritime visualization with Framer Motion animations and full accessibility
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export default function ForecastMap() {
  const [ready, setReady] = useState(false);

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <MapPin className="text-blue-400" aria-hidden="true" />
          <span>Mapa Global de Previsão</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0.5 }}
          transition={{ duration: 1 }}
          aria-label="Mapa de previsões marítimas globais"
        >
          <iframe
            title="Mapa Oceânico - Condições Meteorológicas em Tempo Real"
            className="w-full h-96 rounded-lg border border-gray-700"
            src="https://earth.nullschool.net/#current/wind/surface/level/orthographic=0,0,0"
            loading="lazy"
            onLoad={() => setReady(true)}
            aria-describedby="map-description"
          />
          <p id="map-description" className="sr-only">
            Visualização interativa das condições meteorológicas marítimas globais em tempo real,
            incluindo ventos, ondas e temperatura da superfície do oceano.
          </p>
        </motion.div>
      </CardContent>
    </Card>
  );
}
