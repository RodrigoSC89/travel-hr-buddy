import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ListaAuditoriasIMCA } from "@/components/auditorias/ListaAuditoriasIMCA";

export default function AuditoriasIMCA() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">⚓ Auditorias IMCA</h1>
        </div>
      </div>

      <ListaAuditoriasIMCA />
    </div>
  );
}
