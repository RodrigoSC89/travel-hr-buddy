import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ListaAuditoriasIMCA from "@/components/auditorias/ListaAuditoriasIMCA";

/**
 * Page wrapper for IMCA Audits listing
 * Provides navigation back to admin dashboard and displays the audit list component
 */
export default function AuditoriasIMCAPage() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Navigation header */}
        <div className="mb-6">
          <Link to="/admin">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar para Admin
            </Button>
          </Link>
        </div>

        {/* Main component */}
        <ListaAuditoriasIMCA />
      </div>
    </div>
  );
}
