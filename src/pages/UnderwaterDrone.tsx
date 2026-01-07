import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";

export default function UnderwaterDrone() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Zap className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Underwater Drone</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Módulo em Desenvolvimento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Sistema de controle de drones submarinos em desenvolvimento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
