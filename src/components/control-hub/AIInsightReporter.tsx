// @ts-nocheck
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { FileText, Brain } from "lucide-react";

export default function AIInsightReporter() {
  const [report, setReport] = useState(null);

  useEffect(() => {
    fetch("/api/insights")
      .then((res) => res.json())
      .then((data) => setReport(data.summary))
      .catch(() => setReport("Falha ao carregar relatório."));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="text-[var(--nautilus-primary)]" /> AI Insight Reporter
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-300 mb-2">
          Relatórios automáticos de performance e falhas de subsistemas.
        </p>
        <div className="border-l-2 border-[var(--nautilus-accent)] pl-4 text-gray-200 text-sm">
          {report || "Gerando relatório..."}
        </div>
        <div className="flex justify-end mt-4">
          <button className="bg-[var(--nautilus-primary)] text-white px-3 py-1 rounded flex items-center gap-2">
            <FileText size={16} /> Exportar PDF
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
