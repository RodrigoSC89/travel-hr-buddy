import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ListaAuditoriasIMCA from "@/components/auditorias/ListaAuditoriasIMCA";

export default function AuditoriasLista() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Lista de Auditorias IMCA</h1>
        <Button
          variant="outline"
          onClick={() => navigate("/admin")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Admin
        </Button>
      </div>

      <ListaAuditoriasIMCA />
    </div>
  );
}
