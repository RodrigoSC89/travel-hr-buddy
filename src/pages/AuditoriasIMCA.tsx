import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ListaAuditoriasIMCA from "@/components/sgso/ListaAuditoriasIMCA";

export default function AuditoriasIMCA() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/sgso">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para SGSO
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <ListaAuditoriasIMCA />
    </div>
  );
}
