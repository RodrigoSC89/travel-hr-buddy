import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Ship, MapPin, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Port, VoyageRoute } from "../types";
import { usePorts, useCreateVoyageRoute } from "../hooks/useVoyageData";
import { toast } from "sonner";

interface CreateVoyageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateVoyage: () => void;
}

const CreateVoyageDialog: React.FC<CreateVoyageDialogProps> = ({
  open,
  onOpenChange,
  onCreateVoyage,
}) => {
  const { data: ports = [], isLoading: portsLoading } = usePorts();
  const createMutation = useCreateVoyageRoute();
  
  const [formData, setFormData] = useState({
    originId: "",
    destinationId: "",
    vesselName: "",
    departureDate: "",
  });

  const origins = ports.filter((p) => p.type === "origin" || p.type === "waypoint" || p.type === "destination");
  const destinations = ports.filter((p) => p.type === "destination" || p.type === "waypoint");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const origin = ports.find((p) => p.id === formData.originId);
    const destination = ports.find((p) => p.id === formData.destinationId);

    if (!origin || !destination) {
      toast.error("Selecione origem e destino");
      return;
    }

    // Calculate estimated values
    const distance = calculateDistance(origin, destination);
    const estimatedDays = Math.ceil(distance / 400); // ~400nm per day average
    const fuelConsumption = Math.round(distance * 0.52); // fuel factor

    const newVoyage: Partial<VoyageRoute> = {
      name: `${origin.name} → ${destination.name}`,
      origin,
      destination,
      waypoints: [],
      distanceNm: Math.round(distance),
      estimatedDays,
      fuelConsumption,
      vesselName: formData.vesselName,
      departureDate: formData.departureDate,
      arrivalDate: calculateArrivalDate(formData.departureDate, estimatedDays),
      weatherRisk: "low",
    };

    try {
      await createMutation.mutateAsync(newVoyage);
      onCreateVoyage();
      onOpenChange(false);
      setFormData({ originId: "", destinationId: "", vesselName: "", departureDate: "" });
    } catch (error) {
      toast.error("Erro ao criar viagem");
    }
  };

  const calculateDistance = (origin: Port, destination: Port): number => {
    // Haversine formula approximation in nautical miles
    const R = 3440.065; // Earth radius in nm
    const dLat = ((destination.lat - origin.lat) * Math.PI) / 180;
    const dLon = ((destination.lng - origin.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((origin.lat * Math.PI) / 180) *
        Math.cos((destination.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const calculateArrivalDate = (departure: string, days: number): string => {
    if (!departure) return "";
    const date = new Date(departure);
    date.setDate(date.getDate() + days);
    return date.toISOString().split("T")[0];
  };

  const noPorts = ports.length === 0 && !portsLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ship className="w-5 h-5" />
            Nova Viagem
          </DialogTitle>
          <DialogDescription>
            Planeje uma nova viagem marítima
          </DialogDescription>
        </DialogHeader>

        {noPorts && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Nenhum porto cadastrado. Configure os portos nas configurações do sistema primeiro.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Porto de Origem</Label>
            <Select
              value={formData.originId}
              onValueChange={(v) => setFormData((p) => ({ ...p, originId: v }))}
              disabled={noPorts || portsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={portsLoading ? "Carregando portos..." : "Selecione o porto de origem"} />
              </SelectTrigger>
              <SelectContent>
                {origins.map((port) => (
                  <SelectItem key={port.id} value={port.id}>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {port.name}, {port.country} ({port.code})
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Porto de Destino</Label>
            <Select
              value={formData.destinationId}
              onValueChange={(v) => setFormData((p) => ({ ...p, destinationId: v }))}
              disabled={noPorts || portsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={portsLoading ? "Carregando portos..." : "Selecione o porto de destino"} />
              </SelectTrigger>
              <SelectContent>
                {destinations
                  .filter((p) => p.id !== formData.originId)
                  .map((port) => (
                    <SelectItem key={port.id} value={port.id}>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {port.name}, {port.country} ({port.code})
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vessel">Nome da Embarcação</Label>
            <Input
              id="vessel"
              placeholder="Ex: MV Atlantic Pioneer"
              value={formData.vesselName}
              onChange={(e) => setFormData((p) => ({ ...p, vesselName: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="departure">Data de Partida</Label>
            <Input
              id="departure"
              type="date"
              value={formData.departureDate}
              onChange={(e) => setFormData((p) => ({ ...p, departureDate: e.target.value }))}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending || !formData.originId || !formData.destinationId || noPorts}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Viagem"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateVoyageDialog;
