import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  Users,
  Phone,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Download,
  Printer,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmergencyPlan {
  id: string;
  type: string;
  title: string;
  status: string;
  last_drill: string;
  next_drill: string;
  drill_frequency_days: number;
  responsible: string;
  contacts: number;
}

interface ViewPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: EmergencyPlan | null;
}

const getPlanDetails = (plan: EmergencyPlan) => {
  const details: Record<string, unknown> = {
    fire: {
      objective: "Combater e extinguir incêndios a bordo, protegendo vidas e propriedade.",
      scope: "Aplica-se a todas as embarcações e instalações marítimas da organização.",
      procedures: [
        "Detecção e alarme de incêndio",
        "Evacuação de área afetada",
        "Acionamento de equipe de combate",
        "Uso de extintores e mangueiras",
        "Comunicação com autoridades",
        "Primeiros socorros a vítimas"
      ],
      equipment: [
        "Extintores CO2 e Pó Químico",
        "Mangueiras de incêndio",
        "Bombas de combate a incêndio",
        "EPIs térmicos",
        "Detectores de fumaça"
      ],
      contacts: [
        { name: "Comandante", phone: "Ramal 101" },
        { name: "Oficial de Segurança", phone: "Ramal 105" },
        { name: "Corpo de Bombeiros", phone: "193" }
      ]
    },
    oil_spill: {
      objective: "Conter e remediar derramamentos de óleo, minimizando impacto ambiental.",
      scope: "Operações de carga/descarga e armazenamento de combustíveis.",
      procedures: [
        "Identificação do vazamento",
        "Acionamento de contenção primária",
        "Implantação de barreiras de contenção",
        "Uso de absorventes oleofílicos",
        "Notificação ao IBAMA",
        "Documentação fotográfica"
      ],
      equipment: [
        "Barreiras de contenção 500m",
        "Skimmers de superfície",
        "Absorventes oleofílicos",
        "Bombas de sucção",
        "EPIs para produtos químicos"
      ],
      contacts: [
        { name: "Eng. Ambiental", phone: "Ramal 150" },
        { name: "IBAMA", phone: "0800-61-8080" },
        { name: "Defesa Civil", phone: "199" }
      ]
    },
    man_overboard: {
      objective: "Resgatar pessoa em situação de queda ao mar com máxima rapidez.",
      scope: "Todas as operações em alto mar e áreas portuárias.",
      procedures: [
        "Gritar 'Homem ao Mar!' e indicar posição",
        "Lançar boia salva-vidas",
        "Manobra de Williamson",
        "Resgate com bote ou rede",
        "Primeiros socorros a bordo",
        "Registro do incidente"
      ],
      equipment: [
        "Boias salva-vidas com luz",
        "Bote de resgate inflável",
        "Redes de resgate",
        "Coletes salva-vidas extras",
        "MOB System eletrônico"
      ],
      contacts: [
        { name: "Imediato", phone: "Ramal 102" },
        { name: "MRCC Brasil", phone: "0800-941-185" },
        { name: "Enfermaria", phone: "Ramal 120" }
      ]
    },
    medical: {
      objective: "Prestar atendimento médico de emergência a bordo.",
      scope: "Atendimento inicial e estabilização de vítimas.",
      procedures: [
        "Avaliação primária da vítima",
        "Estabilização de sinais vitais",
        "Administração de medicamentos",
        "Contato com médico em terra",
        "Evacuação médica se necessário",
        "Documentação médica"
      ],
      equipment: [
        "Desfibrilador (DEA)",
        "Kit de primeiros socorros",
        "Medicamentos de emergência",
        "Maca de transporte",
        "Oxigênio medicinal"
      ],
      contacts: [
        { name: "Enfermeiro de Bordo", phone: "Ramal 120" },
        { name: "TELEMEDICINA", phone: "0800-XXX-XXXX" },
        { name: "SAMU", phone: "192" }
      ]
    },
    abandon_ship: {
      objective: "Evacuação segura de todos os tripulantes e passageiros.",
      scope: "Situações de risco iminente à integridade da embarcação.",
      procedures: [
        "Alarme de abandonar navio",
        "Reunião nos pontos de encontro",
        "Distribuição de coletes",
        "Embarque nas balsas/botes",
        "Lançamento de balsas",
        "Afastamento da embarcação"
      ],
      equipment: [
        "Balsas salva-vidas",
        "Botes de resgate",
        "Coletes salva-vidas",
        "EPIRB",
        "Kit de sobrevivência"
      ],
      contacts: [
        { name: "Comandante", phone: "Ramal 101" },
        { name: "MRCC Brasil", phone: "0800-941-185" },
        { name: "Capitania", phone: "185" }
      ]
    }
  };
  
  return details[plan.type] || details.fire;
};

export const ViewPlanDialog: React.FC<ViewPlanDialogProps> = ({
  open,
  onOpenChange,
  plan
}) => {
  const { toast } = useToast();

  if (!plan) return null;

  const details = getPlanDetails(plan);

  const handleDownload = () => {
    toast({
      title: "Download iniciado",
      description: `Baixando ${plan.title} em PDF...`,
};
  };

  const handlePrint = () => {
    window.print();
    toast({
      title: "Preparando impressão",
      description: "Documento enviado para impressão",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-6 w-6 text-primary" />
            {plan.title}
          </DialogTitle>
          <DialogDescription>
            Detalhes completos do plano de resposta a emergência
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] pr-4">
          <div className="space-y-6">
            {/* Header Info */}
            <div className="flex flex-wrap gap-2 items-center">
              <Badge variant={plan.status === "active" ? "default" : "secondary"}>
                {plan.status === "active" ? "Ativo" : "Em Revisão"}
              </Badge>
              <Badge variant="outline">
                Revisão: {plan.drill_frequency_days} dias
              </Badge>
              <Badge variant="outline">
                <Users className="h-3 w-3 mr-1" />
                {plan.contacts} contatos
              </Badge>
            </div>

            {/* Objective */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Objetivo
                </h4>
                <p className="text-muted-foreground">{details.objective}</p>
              </CardContent>
            </Card>

            {/* Scope */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  Escopo de Aplicação
                </h4>
                <p className="text-muted-foreground">{details.scope}</p>
              </CardContent>
            </Card>

            {/* Procedures */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-orange-600" />
                  Procedimentos
                </h4>
                <ol className="list-decimal list-inside space-y-2">
                  {details.procedures.map((proc: string, idx: number) => (
                    <li key={idx} className="text-muted-foreground">{proc}</li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {/* Equipment */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  Equipamentos Necessários
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {details.equipment.map((item: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contacts */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-purple-600" />
                  Contatos de Emergência
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {details.contacts.map((contact: unknown, idx: number) => (
                    <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                      <p className="font-medium text-sm">{contact.name}</p>
                      <p className="text-primary font-bold">{contact.phone}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-cyan-600" />
                  Cronograma
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200">
                    <p className="text-xs text-muted-foreground">Último Simulado</p>
                    <p className="font-bold text-green-700 dark:text-green-400">
                      {new Date(plan.last_drill).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200">
                    <p className="text-xs text-muted-foreground">Próximo Simulado</p>
                    <p className="font-bold text-blue-700 dark:text-blue-400">
                      {new Date(plan.next_drill).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200">
                    <p className="text-xs text-muted-foreground">Responsável</p>
                    <p className="font-bold text-orange-700 dark:text-orange-400">
                      {plan.responsible}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <Separator />

        <div className="flex justify-between gap-2">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Baixar PDF
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </div>
          <Button onClick={() => handleonOpenChange}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
