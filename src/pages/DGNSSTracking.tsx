/**
 * DGNSS Tracking - Placeholder
 */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation } from "lucide-react";

export default function DGNSSTracking() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Navigation className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">DGNSS Tracking</h2>
          <p className="text-muted-foreground">Rastreamento por DGNSS</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Posicionamento DGNSS</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Módulo de tracking DGNSS em desenvolvimento.</p>
        </CardContent>
      </Card>
    </div>
  );
}
