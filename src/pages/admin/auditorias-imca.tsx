import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ListaAuditoriasIMCA } from "@/components/sgso/ListaAuditoriasIMCA";

export default function AuditoriasIMCAPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
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
