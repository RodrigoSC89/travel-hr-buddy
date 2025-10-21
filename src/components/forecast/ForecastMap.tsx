/**
 * ForecastMap Component
 * Maritime Prediction Visualization with Accessibility
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export default function ForecastMap() {
  const [ready, setReady] = useState(false);

  const handleLoad = () => {
    setReady(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MapPin className="h-6 w-6 text-blue-500" aria-hidden="true" />
          <CardTitle>Mapa de Previsões Marítimas</CardTitle>
        </div>
        <CardDescription>
          Visualização global das condições previstas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0.5 }}
          transition={{ duration: 1 }}
          className="relative w-full h-[400px] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800"
          aria-label="Mapa de previsões marítimas globais"
        >
          {!ready && (
            <div 
              className="absolute inset-0 flex items-center justify-center"
              role="status"
              aria-live="polite"
            >
              <div className="text-center">
                <div 
                  className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"
                  aria-hidden="true"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Carregando mapa...
                </p>
              </div>
            </div>
          )}
          <iframe
            src="https://www.windy.com/embed2.html?lat=0&lon=0&zoom=2&level=surface&overlay=wind&product=ecmwf&menu=&message=true&marker=&calendar=&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1"
            title="Maritime forecast map"
            className="w-full h-full border-0"
            loading="lazy"
            onLoad={handleLoad}
          />
        </motion.div>
      </CardContent>
    </Card>
  );
}
