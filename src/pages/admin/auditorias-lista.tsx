/**
 * Admin Page: Lista de Auditorias IMCA
 * Provides a wrapper for the ListaAuditoriasIMCA component
 */

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ListaAuditoriasIMCA from "@/components/auditorias/ListaAuditoriasIMCA";

export default function AuditoriasListaPage() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link to="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Admin
            </Button>
          </Link>
        </div>

        <ListaAuditoriasIMCA />
      </div>
    </div>
  );
}
