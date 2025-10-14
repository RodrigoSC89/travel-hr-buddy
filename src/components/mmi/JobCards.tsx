"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Job {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string;
  component: {
    name: string;
    asset: {
      name: string;
      vessel: string;
    };
  };
  suggestion_ia?: string;
}

export default function JobCards() {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    // Mock data for demonstration - in production this would fetch from /api/mmi/jobs
    const mockJobs: Job[] = [
      {
        id: "1",
        title: "Inspeção do Sistema Hidráulico",
        status: "Em andamento",
        priority: "Alta",
        due_date: "2025-10-20",
        component: {
          name: "Bomba Hidráulica Principal",
          asset: {
            name: "Sistema de Propulsão",
            vessel: "MV-Atlas"
          }
        },
        suggestion_ia: "Recomenda-se verificar níveis de pressão e temperatura. Histórico indica possível vazamento."
      },
      {
        id: "2",
        title: "Manutenção Preventiva - Motor Diesel",
        status: "Agendado",
        priority: "Média",
        due_date: "2025-10-25",
        component: {
          name: "Motor Principal MAN B&W",
          asset: {
            name: "Propulsão Principal",
            vessel: "MV-Neptune"
          }
        },
        suggestion_ia: "Análise preditiva sugere troca de filtros e verificação de injetores."
      },
      {
        id: "3",
        title: "Reparo Urgente - Sistema Elétrico",
        status: "Aguardando",
        priority: "Crítica",
        due_date: "2025-10-16",
        component: {
          name: "Gerador Auxiliar #2",
          asset: {
            name: "Sistema Elétrico",
            vessel: "MV-Poseidon"
          }
        },
        suggestion_ia: "IA detectou anomalia no sistema de refrigeração. Intervenção imediata recomendada."
      },
      {
        id: "4",
        title: "Inspeção de Segurança Anual",
        status: "Planejado",
        priority: "Baixa",
        due_date: "2025-11-05",
        component: {
          name: "Sistema de Combate a Incêndio",
          asset: {
            name: "Segurança",
            vessel: "MV-Titan"
          }
        }
      }
    ];

    setJobs(mockJobs);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {jobs.map((job) => (
        <Card key={job.id} className="border-l-4 border-yellow-500 p-4 shadow-sm">
          <CardContent className="space-y-2">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-yellow-900">{job.title}</h3>
              <span className="text-xs text-gray-500">{job.due_date}</span>
            </div>
            <p className="text-sm text-gray-700">
              Componente: {job.component.name} — Embarcação: {job.component.asset.vessel}
            </p>
            <div className="flex flex-wrap gap-1 text-xs pt-1">
              <Badge variant="outline">Prioridade: {job.priority}</Badge>
              <Badge variant="outline">Status: {job.status}</Badge>
              {job.suggestion_ia && <Badge variant="secondary">💡 Sugestão IA</Badge>}
            </div>
            {job.suggestion_ia && (
              <div className="mt-2 bg-gray-50 p-2 rounded text-xs text-gray-800">
                {job.suggestion_ia}
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Button variant="default" size="sm">Ver detalhes</Button>
              <Button variant="outline" size="sm">Executar Job</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
