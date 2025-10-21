// @ts-nocheck
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export default function ForecastMap() {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <MapPin className="text-blue-400" />
          <span>Mapa Global de Previsão</span>
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
