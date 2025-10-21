// @ts-nocheck
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export default function ForecastMap() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="text-[var(--nautilus-primary)]" /> Mapa Global de Previsão
        </CardTitle>
      </CardHeader>
      <CardContent>
        <iframe
          title="Mapa Oceânico"
          className="w-full h-96 rounded-lg border border-gray-700"
          src="https://earth.nullschool.net/#current/wind/surface/level/orthographic=0,0,0"
        />
      </CardContent>
    </Card>
  );
}
