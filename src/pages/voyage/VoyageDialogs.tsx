/**
 * Voyage Command Center - Dialogs (Create + Details)
 */
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Brain, Sparkles, CheckCircle2 } from "lucide-react";
import type { Port, VoyageRoute } from "./types";

interface CreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ports: Port[];
  newVoyage: { origin: string; destination: string; vessel: string; departure: string };
  onNewVoyageChange: (v: { origin: string; destination: string; vessel: string; departure: string }) => void;
  onCreate: () => void;
}

export function CreateVoyageDialog({ open, onOpenChange, ports, newVoyage, onNewVoyageChange, onCreate }: CreateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Viagem</DialogTitle>
          <DialogDescription>Planeje uma nova viagem com assistência de IA</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Origem</Label>
            <Select onValueChange={v => onNewVoyageChange({ ...newVoyage, origin: v })}>
              <SelectTrigger><SelectValue placeholder="Selecionar porto de origem" /></SelectTrigger>
              <SelectContent>
                {ports.filter(p => p.type === "origin").map(port => (
                  <SelectItem key={port.id} value={port.id}>{port.name}, {port.country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Destino</Label>
            <Select onValueChange={v => onNewVoyageChange({ ...newVoyage, destination: v })}>
              <SelectTrigger><SelectValue placeholder="Selecionar porto de destino" /></SelectTrigger>
              <SelectContent>
                {ports.filter(p => p.type === "destination").map(port => (
                  <SelectItem key={port.id} value={port.id}>{port.name}, {port.country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Embarcação</Label>
            <Select onValueChange={v => onNewVoyageChange({ ...newVoyage, vessel: v })}>
              <SelectTrigger><SelectValue placeholder="Selecionar embarcação" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="MV Atlantic Pioneer">MV Atlantic Pioneer</SelectItem>
                <SelectItem value="MV Pacific Star">MV Pacific Star</SelectItem>
                <SelectItem value="MV Gulf Carrier">MV Gulf Carrier</SelectItem>
                <SelectItem value="MV Europa Express">MV Europa Express</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Data de Partida</Label>
            <Input
              type="date"
              value={newVoyage.departure}
              onChange={e => onNewVoyageChange({ ...newVoyage, departure: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Viagem
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface DetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voyage: VoyageRoute | null;
  onOptimize: (id: string) => void;
}

export function VoyageDetailsDialog({ open, onOpenChange, voyage, onOptimize }: DetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{voyage?.name}</DialogTitle>
          <DialogDescription>{voyage?.vesselName}</DialogDescription>
        </DialogHeader>
        {voyage && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Origem", value: `${voyage.origin.name}, ${voyage.origin.country}` },
                { label: "Destino", value: `${voyage.destination.name}, ${voyage.destination.country}` },
                { label: "Distância", value: `${voyage.distanceNm} milhas náuticas` },
                { label: "Duração Estimada", value: `${voyage.estimatedDays} dias` },
                { label: "Combustível", value: `${voyage.fuelConsumption} toneladas` },
                { label: "Custo Estimado", value: `R$ ${(voyage.estimatedCost || 0).toLocaleString()}` },
                { label: "Partida", value: voyage.departureDate || "N/A" },
                { label: "Chegada", value: voyage.arrivalDate || "N/A" },
              ].map(item => (
                <div key={item.label}>
                  <Label className="text-muted-foreground">{item.label}</Label>
                  <p className="font-medium">{item.value}</p>
                </div>
              ))}
            </div>

            {voyage.waypoints.length > 0 && (
              <div>
                <Label className="text-muted-foreground">Escalas</Label>
                <div className="flex gap-2 mt-1">
                  {voyage.waypoints.map(wp => (
                    <Badge key={wp.id} variant="outline">{wp.name}</Badge>
                  ))}
                </div>
              </div>
            )}

            {voyage.aiRecommendations && voyage.aiRecommendations.length > 0 && (
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">Recomendações IA</span>
                </div>
                <ul className="space-y-1">
                  {voyage.aiRecommendations.map((rec, idx) => (
                    <li key={`vcc-rec-${idx}-${rec.slice(0, 10)}`} className="text-sm text-muted-foreground flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
          <Button onClick={() => {
            if (voyage) onOptimize(voyage.id);
            onOpenChange(false);
          }}>
            <Brain className="h-4 w-4 mr-2" />
            Otimizar com IA
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
