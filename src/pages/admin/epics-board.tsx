/**
 * Admin Epics Board
 * Tracks progress of patches/features with automated test validation
 */

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";

// Simple badge component inline
const SimpleBadge = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>
    {children}
  </span>
);

// Patch progress data
const epicsData = [
  {
    id: "603",
    name: "Agendamento com IA",
    status: "done",
    area: "smart-scheduler",
    type: "AI / Calendar",
    tests: ["e2e", "unit"],
    description: "Sistema de agendamento inteligente baseado em IA para otimização de inspeções",
  },
  {
    id: "605",
    name: "ESG & EEXI Tracker",
    status: "done",
    area: "esg-dashboard",
    type: "Analytics",
    tests: ["e2e", "unit"],
    description: "Dashboard de monitoramento ESG com previsões de emissões e conformidade EEXI",
  },
  {
    id: "606",
    name: "Auditoria Remota com IA",
    status: "done",
    area: "remote-audits",
    type: "Compliance",
    tests: ["e2e", "unit"],
    description: "Sistema de auditoria remota com análise automática de evidências por IA",
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "done":
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case "in-progress":
      return <Circle className="h-5 w-5 text-yellow-500" />;
    case "pending":
      return <Circle className="h-5 w-5 text-gray-400" />;
    default:
      return <AlertCircle className="h-5 w-5 text-red-500" />;
  }
};

const getStatusBadge = (status: string) => {
  const statusMap: Record<string, { label: string; className: string }> = {
    done: { label: "🟢 Em produção", className: "bg-green-100 text-green-800" },
    "in-progress": { label: "🟡 Em desenvolvimento", className: "bg-yellow-100 text-yellow-800" },
    pending: { label: "⚪ Pendente", className: "bg-gray-100 text-gray-800" },
  };

  const statusInfo = statusMap[status] || statusMap.pending;
  return <SimpleBadge className={statusInfo.className}>{statusInfo.label}</SimpleBadge>;
};

const getTestBadges = (tests: string[]) => {
  return tests.map((test) => {
    const testMap: Record<string, { icon: string; label: string }> = {
      e2e: { icon: "✅", label: "E2E" },
      unit: { icon: "✅", label: "Unit" },
      integration: { icon: "✅", label: "Integration" },
    };

    const testInfo = testMap[test] || { icon: "❌", label: test };
    return (
      <SimpleBadge key={test} className="ml-1 bg-blue-100 text-blue-800">
        {testInfo.icon} {testInfo.label}
      </SimpleBadge>
    );
  });
};

export default function EpicsBoard() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Epics Board</h1>
        <p className="text-muted-foreground">
          Acompanhamento de patches e funcionalidades com validações automatizadas
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Patches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{epicsData.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Em Produção</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {epicsData.filter((e) => e.status === "done").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Com E2E Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {epicsData.filter((e) => e.tests.includes("e2e")).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Com Unit Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {epicsData.filter((e) => e.tests.includes("unit")).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Epics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Patches Implementados</CardTitle>
          <CardDescription>Status e validações de cada patch</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">PATCH</th>
                  <th className="text-left p-3 font-semibold">Nome</th>
                  <th className="text-left p-3 font-semibold">Status</th>
                  <th className="text-left p-3 font-semibold">Módulo</th>
                  <th className="text-left p-3 font-semibold">Tipo</th>
                  <th className="text-left p-3 font-semibold">Validações</th>
                </tr>
              </thead>
              <tbody>
                {epicsData.map((epic) => (
                  <tr key={epic.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(epic.status)}
                        <span className="font-mono font-semibold">#{epic.id}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <div className="font-medium">{epic.name}</div>
                        <div className="text-sm text-muted-foreground">{epic.description}</div>
                      </div>
                    </td>
                    <td className="p-3">{getStatusBadge(epic.status)}</td>
                    <td className="p-3">
                      <code className="text-sm bg-muted px-2 py-1 rounded">{epic.area}</code>
                    </td>
                    <td className="p-3">
                      <SimpleBadge className="bg-purple-100 text-purple-800">{epic.type}</SimpleBadge>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">{getTestBadges(epic.tests)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* JSON Export */}
      <Card>
        <CardHeader>
          <CardTitle>Dados em JSON</CardTitle>
          <CardDescription>Estrutura de dados para integração</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
            <code>{JSON.stringify(epicsData, null, 2)}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
