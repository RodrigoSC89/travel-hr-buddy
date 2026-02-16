/**
 * Voyage Command Center - Routes Tab
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Navigation } from "lucide-react";
import type { Port } from "./types";

interface Props {
  ports: Port[];
}

export function VoyageRoutesTab({ ports }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Portos e Rotas Cadastradas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ports.map((port) => (
            <div key={port.id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{port.name}</h4>
                <Badge variant="outline">{port.code}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{port.country}</p>
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <Navigation className="h-3 w-3" />
                {port.lat.toFixed(2)}°, {port.lng.toFixed(2)}°
              </div>
              <Badge className={`mt-2 ${
                port.type === "origin" ? "bg-green-500/10 text-green-600" :
                port.type === "destination" ? "bg-blue-500/10 text-blue-600" :
                "bg-amber-500/10 text-amber-600"
              }`}>
                {port.type === "origin" ? "Origem" : port.type === "destination" ? "Destino" : "Escala"}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
