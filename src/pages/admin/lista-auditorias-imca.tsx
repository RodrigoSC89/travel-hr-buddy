import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ListaAuditoriasIMCA from "@/components/auditorias/ListaAuditoriasIMCA";

export default function ListaAuditoriasIMCAPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Link to="/admin/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>
        
        <ListaAuditoriasIMCA />
      </div>
    </div>
  );
}
