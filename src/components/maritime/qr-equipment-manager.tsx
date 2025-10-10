import React, { useState } from "react";
import { QrCode, Scan, Plus, Edit, MapPin, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface QREquipment {
  id: string;
  qrCode: string;
  name: string;
  type: string;
  location: string;
  status: "operational" | "maintenance" | "critical";
  lastInspection: Date;
  nextInspection: Date;
  checklist?: string;
  notes?: string;
}

export const QREquipmentManager = () => {
  const [equipment, setEquipment] = useState<QREquipment[]>([
    {
      id: "1",
      qrCode: "EQ001-SAFETY-VALVE",
      name: "Válvula de Segurança Principal",
      type: "Safety Equipment",
      location: "Sala de Máquinas - Deck A",
      status: "operational",
      lastInspection: new Date("2024-12-01"),
      nextInspection: new Date("2024-12-15"),
      checklist: "safety",
    },
    {
      id: "2",
      qrCode: "EQ002-FIRE-EXT",
      name: "Extintor de Incêndio 001",
      type: "Fire Safety",
      location: "Corredor Principal",
      status: "maintenance",
      lastInspection: new Date("2024-11-15"),
      nextInspection: new Date("2024-12-10"),
      checklist: "safety",
    },
  ]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<QREquipment | null>(null);
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-green-100 text-green-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      case "maintenance":
        return <div className="w-2 h-2 bg-yellow-500 rounded-full" />;
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full" />;
    }
  };

  const handleCreateEquipment = () => {
    toast({
      title: "Equipamento Cadastrado",
      description: "Novo equipamento foi cadastrado com QR code gerado.",
    });
    setIsCreateOpen(false);
  };

  const handleScanQR = () => {
    toast({
      title: "Scanner QR",
      description: "Abra a câmera para escanear o código QR do equipamento.",
    });
  };

  const generateQRCode = (equipment: QREquipment) => {
    // Simulate QR code generation
    const qrData = `${window.location.origin}/equipment/${equipment.id}`;
    return qrData;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestão de Equipamentos QR</h2>
          <p className="text-muted-foreground">
            Gerencie equipamentos com códigos QR para inspeções rápidas
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleScanQR}>
            <Scan className="h-4 w-4 mr-2" />
            Escanear QR
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Equipamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Equipamento</DialogTitle>
                <DialogDescription>
                  Adicione um novo equipamento ao sistema com geração automática de QR code
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="equipment-name">Nome do Equipamento</Label>
                    <Input id="equipment-name" placeholder="Ex: Válvula de Segurança" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="equipment-type">Tipo</Label>
                    <Input id="equipment-type" placeholder="Ex: Safety Equipment" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="equipment-location">Localização</Label>
                  <Input id="equipment-location" placeholder="Ex: Sala de Máquinas - Deck A" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="equipment-notes">Observações</Label>
                  <Textarea id="equipment-notes" placeholder="Observações sobre o equipamento..." />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateEquipment}>Cadastrar e Gerar QR</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">Lista de Equipamentos</TabsTrigger>
          <TabsTrigger value="map">Mapa de Localização</TabsTrigger>
          <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="grid gap-4">
            {equipment.map(item => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(item.status)}
                      <div>
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        <CardDescription>
                          {item.type} • {item.location}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(item.status)}>
                        {item.status === "operational"
                          ? "Operacional"
                          : item.status === "maintenance"
                            ? "Manutenção"
                            : "Crítico"}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <QrCode className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Código QR</div>
                      <div className="text-muted-foreground font-mono">{item.qrCode}</div>
                    </div>
                    <div>
                      <div className="font-medium">Última Inspeção</div>
                      <div className="text-muted-foreground">
                        {item.lastInspection.toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Próxima Inspeção</div>
                      <div className="text-muted-foreground">
                        {item.nextInspection.toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Checklist</div>
                      <div className="text-muted-foreground capitalize">
                        {item.checklist || "N/A"}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" size="sm">
                      <MapPin className="h-4 w-4 mr-1" />
                      Localizar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm">
                      <QrCode className="h-4 w-4 mr-1" />
                      Gerar QR
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mapa de Equipamentos</CardTitle>
              <CardDescription>
                Visualização da localização dos equipamentos no navio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-8 text-center">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Mapa Interativo</h3>
                <p className="text-muted-foreground">
                  Aqui seria exibido um mapa interativo mostrando a localização de todos os
                  equipamentos
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <div className="grid gap-4">
            {equipment
              .filter(item => item.status !== "operational")
              .map(item => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(item.status)}
                        <div>
                          <CardTitle className="text-lg">{item.name}</CardTitle>
                          <CardDescription>{item.location}</CardDescription>
                        </div>
                      </div>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status === "maintenance" ? "Manutenção Agendada" : "Crítico"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Próxima Inspeção: </span>
                        {item.nextInspection.toLocaleDateString("pt-BR")}
                      </div>
                      {item.notes && (
                        <div className="text-sm">
                          <span className="font-medium">Observações: </span>
                          {item.notes}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button size="sm">Agendar Manutenção</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
