import { Link } from "react-router-dom";
import ListaAuditoriasIMCA from "@/components/auditorias/ListaAuditoriasIMCA";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function AuditoriasIMCAPage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <Link to="/admin/dashboard-auditorias">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Auditorias IMCA
        </h1>
        <p className="text-muted-foreground mt-2">
          Histórico completo de auditorias IMCA com análise por IA
        </p>
      </div>

      <ListaAuditoriasIMCA />
    </div>
  );
}
