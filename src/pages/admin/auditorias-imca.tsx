import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ListaAuditoriasIMCA from "@/components/auditorias/ListaAuditoriasIMCA";

export default function AuditoriasIMCA() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Link to="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>
        
        <ListaAuditoriasIMCA />
      </div>
    </div>
  );
}
