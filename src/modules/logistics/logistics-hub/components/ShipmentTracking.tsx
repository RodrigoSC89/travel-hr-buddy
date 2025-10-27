import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TruckIcon, MapPin, Clock, Package } from "lucide-react";

const mockShipments = [
  { id: "SHP-001", origin: "Santos", destination: "Rio de Janeiro", status: "in_transit", eta: "2h 30m", items: 45 },
  { id: "SHP-002", origin: "São Paulo", destination: "Salvador", status: "pending", eta: "6h 15m", items: 32 },
  { id: "SHP-003", origin: "Recife", destination: "Fortaleza", status: "delivered", eta: "Entregue", items: 28 },
];

export const ShipmentTracking: React.FC = () => {
  const getStatusColor = (status: string) => {
    const colors = { in_transit: "default", pending: "secondary", delivered: "outline", cancelled: "destructive" };
    return colors[status as keyof typeof colors] || "default";
  };
  const getStatusLabel = (status: string) => {
    const labels = { in_transit: "Em Trânsito", pending: "Pendente", delivered: "Entregue", cancelled: "Cancelado" };
    return labels[status as keyof typeof labels] || status;
  };
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold flex items-center gap-2"><TruckIcon className="h-6 w-6" />Rastreamento de Entregas</h2><p className="text-muted-foreground mt-1">Acompanhe o status das remessas</p></div>
      <div className="space-y-4">
        {mockShipments.map(shipment => (
          <Card key={shipment.id}>
            <CardHeader><div className="flex items-center justify-between"><CardTitle className="text-lg">{shipment.id}</CardTitle><Badge variant={getStatusColor(shipment.status)}>{getStatusLabel(shipment.status)}</Badge></div></CardHeader>
            <CardContent><div className="grid grid-cols-2 md:grid-cols-4 gap-4"><div><p className="text-sm text-muted-foreground">Origem</p><p className="font-medium flex items-center gap-1"><MapPin className="h-3 w-3" />{shipment.origin}</p></div><div><p className="text-sm text-muted-foreground">Destino</p><p className="font-medium flex items-center gap-1"><MapPin className="h-3 w-3" />{shipment.destination}</p></div><div><p className="text-sm text-muted-foreground">ETA</p><p className="font-medium flex items-center gap-1"><Clock className="h-3 w-3" />{shipment.eta}</p></div><div><p className="text-sm text-muted-foreground">Itens</p><p className="font-medium flex items-center gap-1"><Package className="h-3 w-3" />{shipment.items}</p></div></div></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
