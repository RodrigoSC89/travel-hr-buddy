import { useState, useCallback } from "react";;
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
import { Loader2, Ship, MapPin } from "lucide-react";
import type { Port, VoyageRoute } from "../types";
import { DEMO_PORTS } from "../data/demo-data";

interface CreateVoyageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateVoyage: (voyage: VoyageRoute) => void;
}

const CreateVoyageDialog: React.FC<CreateVoyageDialogProps> = ({
  open,
  onOpenChange,
  onCreateVoyage,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    originId: "",
    destinationId: "",
    vesselName: "",
    departureDate: "",
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const origin = DEMO_PORTS.find((p) => p.id === formData.originId);
    const destination = DEMO_PORTS.find((p) => p.id === formData.destinationId);

    if (!origin || !destination) {
      setLoading(false);
      return;
    }

    // Calculate estimated values
    const distance = calculateDistance(origin, destination);
    const estimatedDays = Math.ceil(distance / 400); // ~400nm per day average
    const fuelConsumption = Math.round(distance * 0.52); // fuel factor

    const newVoyage: VoyageRoute = {
      id: `v${Date.now()}`,
      name: `${origin.name} → ${destination.name}`,
      origin,
      destination,
      waypoints: [],
      distanceNm: Math.round(distance),
      estimatedDays,
      fuelConsumption,
      status: "planned",
      vesselName: formData.vesselName,
      departureDate: formData.departureDate,
      arrivalDate: calculateArrivalDate(formData.departureDate, estimatedDays),
      weatherRisk: "low",
      createdAt: new Date().toISOString(),
    };

    await new Promise((r) => setTimeout(r, 500));
    onCreateVoyage(newVoyage);
    setLoading(false);
    onOpenChange(false);
    setFormData({ originId: "", destinationId: "", vesselName: "", departureDate: "" });
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

  const origins = DEMO_PORTS.filter((p) => p.type === "origin" || p.type === "waypoint");
  const destinations = DEMO_PORTS.filter((p) => p.type === "destination" || p.type === "waypoint");

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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Porto de Origem</Label>
            <Select
              value={formData.originId}
              onValueChange={(v) => setFormData((p) => ({ ...p, originId: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o porto de origem" />
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
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o porto de destino" />
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
              onChange={handleChange}))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="departure">Data de Partida</Label>
            <Input
              id="departure"
              type="date"
              value={formData.departureDate}
              onChange={handleChange}))}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleonOpenChange}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.originId || !formData.destinationId}
            >
              {loading ? (
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
