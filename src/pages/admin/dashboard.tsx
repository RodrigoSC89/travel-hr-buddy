"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

export default function AdminDashboard() {
  const [cronStatus, setCronStatus] = useState<"ok" | "warning" | null>(null);
  const [cronMessage, setCronMessage] = useState("");

  useEffect(() => {
    fetch("/api/cron-status")
      .then(async res => {
        const contentType = res.headers.get("content-type");
        // If we get HTML instead of JSON, we're in dev mode without backend
        if (contentType && contentType.includes("text/html")) {
          // Use mock data for development
          return {
            status: "ok",
            message: "Cron diário executado com sucesso nas últimas 24h (Dev Mode)"
          };
        }
        return res.json();
      })
      .then(data => {
        setCronStatus(data.status);
        setCronMessage(data.message);
      })
      .catch(error => {
        console.error("Error fetching cron status:", error);
        setCronStatus("warning");
        setCronMessage("Erro ao carregar status do cron");
      });
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">🚀 Painel Administrativo — Nautilus One</h1>

      {/* Badge de Status do Cron */}
      {cronStatus && (
        <Card className={`p-4 text-sm font-medium ${cronStatus === "ok" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
          {cronStatus === "ok" ? "✅ " : "⚠️ "}{cronMessage}
        </Card>
      )}

      {/* Aqui virão os widgets do dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">📄 Últimos Documentos</Card>
        <Card className="p-4">📋 Tarefas Pendentes</Card>
        <Card className="p-4">💬 Últimas Interações com IA</Card>
      </div>
    </div>
  );
}
