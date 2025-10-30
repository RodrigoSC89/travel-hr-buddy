import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SensorReading } from "../types";

interface SensorPanelProps {
  title: string;
  sensors: SensorReading[];
  onRefresh: () => void;
}

export const SensorPanel: React.FC<SensorPanelProps> = ({ title, sensors }) => (
  <Card>
    <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
    <CardContent>
      <p className="text-muted-foreground">
        {sensors.length} sensor{sensors.length !== 1 ? "s" : ""} active
      </p>
    </CardContent>
  </Card>
);
