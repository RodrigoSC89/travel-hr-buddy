import { useState } from "react";;
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function ForecastMap() {
  const [ready, setReady] = useState(false);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground flex items-center space-x-2">
          <MapPin className="text-primary" aria-hidden="true" />
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
            title="Maritime forecast map"
            className="w-full h-96 rounded-lg border border-border"
            src="https://earth.nullschool.net/#current/wind/surface/level/orthographic=0,0,0"
            loading="lazy"
            onLoad={() => setReady(true)}
            aria-label="Visualização interativa de condições oceânicas em tempo real"
          />
        </motion.div>
      </CardContent>
    </Card>
  );
}
