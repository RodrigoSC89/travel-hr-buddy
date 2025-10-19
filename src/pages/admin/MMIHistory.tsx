"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { exportToPDF } from "@/lib/pdf";

type MMIRecord = {
  id: string;
  vessel_name: string;
  system_name: string;
  task_description: string;
  executed_at: string | null;
  status: "executado" | "pendente" | "atrasado";
};

export default function MMIHistoryPage() {
  const [records, setRecords] = useState<MMIRecord[]>([]);
  const [filter, setFilter] = useState<"todos" | "executado" | "pendente" | "atrasado">("todos");

  useEffect(() => {
    fetch("/api/mmi/history")
      .then(res => res.json())
      .then(data => setRecords(data))
      .catch(error => {
        console.error("Error fetching MMI history:", error);
      });
  }, []);

  const filteredRecords = records.filter(record => {
    if (filter === "todos") return true;
    return record.status === filter;
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📊 Histórico de Manutenções (MMI)</h1>

      <div className="mb-4">
        <label className="mr-2 font-semibold">Filtro por status:</label>
        <select
          className="border rounded px-2 py-1"
          value={filter}
          onChange={(e) => setFilter(e.target.value as "todos" | "executado" | "pendente" | "atrasado")}
        >
          <option value="todos">Todos</option>
          <option value="executado">Executado</option>
          <option value="pendente">Pendente</option>
          <option value="atrasado">Atrasado</option>
        </select>
      </div>

      {filteredRecords.length === 0 && <p>Nenhum registro encontrado para o filtro selecionado.</p>}

      {filteredRecords.map((record) => (
        <div key={record.id} className="border rounded p-4 mb-3 shadow-sm bg-white">
          <p><strong>🚢 Embarcação:</strong> {record.vessel_name}</p>
          <p><strong>🛠 Sistema:</strong> {record.system_name}</p>
          <p><strong>📅 Data Execução:</strong> {record.executed_at || "---"}</p>
          <p><strong>📌 Status:</strong> {record.status}</p>
          <p className="my-2"><strong>📝 Descrição:</strong> {record.task_description}</p>
          <Button
            variant="outline"
            onClick={() => exportToPDF(record.task_description, `mmi-${record.id}.pdf`)}
          >
            📄 Exportar PDF
          </Button>
        </div>
      ))}
    </div>
  );
}
