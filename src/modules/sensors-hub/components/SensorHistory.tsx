import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SensorHistoryProps {
  sensorType: string;
}

export const SensorHistory: React.FC<SensorHistoryProps> = ({ sensorType }) => (
  <Card>
    <CardHeader><CardTitle>Sensor History - {sensorType}</CardTitle></CardHeader>
    <CardContent>
      <p className="text-muted-foreground">Historical data visualization placeholder</p>
    </CardContent>
  </Card>
);
