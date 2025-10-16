import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle, Hourglass } from "lucide-react";

const modules = [
  { name: "Autenticação & Roles", status: "ok" },
  { name: "Documentos com IA", status: "ok" },
  { name: "Checklists Inteligentes", status: "ok" },
  { name: "Assistente IA", status: "ok" },
  { name: "Dashboard & Relatórios", status: "ok" },
  { name: "Logs & Restauração", status: "ok" },
  { name: "Smart Workflow", status: "error" },
  { name: "Templates com IA", status: "partial" },
  { name: "Forecast (Previsão IA)", status: "partial" },
  { name: "MMI - Manutenção Inteligente", status: "partial" },
  { name: "Centro de Inteligência DP", status: "pending" },
  { name: "Auditoria Técnica FMEA", status: "pending" },
  { name: "PEO-DP Inteligente", status: "pending" },
];

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
  case "ok":
    return (
      <Badge className="bg-green-600 text-white">
        <CheckCircle className="w-4 h-4 mr-1" /> Funcional
      </Badge>
    );
  case "partial":
    return (
      <Badge className="bg-yellow-500 text-white">
        <AlertTriangle className="w-4 h-4 mr-1" /> Parcial
      </Badge>
    );
  case "error":
    return (
      <Badge className="bg-red-600 text-white">
        <XCircle className="w-4 h-4 mr-1" /> Erro 404
      </Badge>
    );
  case "pending":
    return (
      <Badge className="bg-gray-500 text-white">
        <Hourglass className="w-4 h-4 mr-1" /> Planejado
      </Badge>
    );
  default:
    return null;
  }
};

export default function AdminStatusPanel() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      {modules.map((module) => (
        <Card key={module.name} className="border shadow-md">
          <CardContent className="p-4 flex items-center justify-between">
            <span className="font-medium text-sm md:text-base">{module.name}</span>
            <StatusBadge status={module.status} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
