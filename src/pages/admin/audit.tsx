import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ListaAuditoriasIMCA from "@/components/auditorias/ListaAuditoriasIMCA";

export default function AuditPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link to="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Admin
            </Button>
          </Link>
        </div>

        <section className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Auditoria Técnica IMCA</h1>
            <p className="text-muted-foreground mt-2">
              Relatórios técnicos, planos de ação e conformidade com IMCA.
            </p>
          </div>

          <ListaAuditoriasIMCA />
        </section>
      </div>
    </div>
  );
}
