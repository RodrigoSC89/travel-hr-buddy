"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Ship, User, FileSearch } from "lucide-react";
import { logger } from "@/lib/logger";

interface Audit {
  id: string;
  audit_date: string;
  vessel_id: string | null;
  auditor_id: string | null;
  vessels?: {
    name: string;
  } | null;
}

export default function SGSOAuditHistoryPage() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAudits = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("sgso_audits")
          .select(`
            id,
            audit_date,
            vessel_id,
            auditor_id,
            vessels ( name )
          `)
          .order("audit_date", { ascending: false });

        if (error) {
          logger.error("Error fetching SGSO audits", { error: error.message });
        } else if (data) {
          setAudits(data as unknown as Audit[]);
        }
      } catch (err) {
        logger.error("SGSO History fetch error", { error: String(err) });
      } finally {
        setLoading(false);
      }
    };

    fetchAudits();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Histórico de Auditorias SGSO</h1>
        <Link to="/sgso">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : audits.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          Nenhuma auditoria encontrada
        </Card>
      ) : (
        <div className="grid gap-4">
          {audits.map((audit) => (
            <Card key={audit.id} className="p-4 space-y-3 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 text-foreground">
                <Ship className="h-4 w-4 text-primary" />
                <span className="font-medium">Navio:</span>
                <span>{audit.vessels?.name || "Não especificado"}</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="font-medium">Data:</span>
                <span>{new Date(audit.audit_date).toLocaleDateString("pt-BR")}</span>
              </div>

              <Link
                to={`/admin/sgso/review/${audit.id}`}
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 text-sm mt-2 font-medium"
              >
                <FileSearch className="h-4 w-4" />
                Reabrir Auditoria
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
