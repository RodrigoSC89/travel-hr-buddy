"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface Audit {
  id: string
  audit_date: string
  vessel_id: string
  auditor_id: string
  vessels?: {
    name: string
  }
  users?: {
    full_name: string
  }
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
            vessels ( name ),
            users:auditor_id ( full_name )
          `)
          .order("audit_date", { ascending: false });

        if (error) {
          console.error("Error fetching audits:", error);
        } else if (data) {
          setAudits(data as Audit[]);
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAudits();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">🗂️ Histórico de Auditorias SGSO</h1>
        <Link to="/admin/sgso">
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
        audits.map((audit) => (
          <Card key={audit.id} className="p-4 space-y-2">
            <p><strong>Navio:</strong> {audit.vessels?.name || "---"}</p>
            <p><strong>Auditor:</strong> {audit.users?.full_name || "---"}</p>
            <p><strong>Data:</strong> {new Date(audit.audit_date).toLocaleDateString("pt-BR")}</p>

            <Link
              to={`/admin/sgso/review/${audit.id}`}
              className="text-blue-600 underline text-sm inline-block mt-2"
            >
              🔍 Reabrir Auditoria
            </Link>
          </Card>
        ))
      )}
    </div>
  );
}
