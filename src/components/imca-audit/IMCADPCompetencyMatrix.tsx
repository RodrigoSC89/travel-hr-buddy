import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle, Users } from "lucide-react";

interface Props {
  selectedDPClass: "DP1" | "DP2" | "DP3";
}

const competencyRequirements = [
  { role: "DPO (Senior)", imcaM117: "Unlimited DPO", stcw: "STCW II/2", simulator: "Phase 2+", experience: "360+ dias DP" },
  { role: "DPO (Trainee)", imcaM117: "Trainee DPO", stcw: "STCW II/1", simulator: "Phase 1", experience: "Em treinamento" },
  { role: "Chief Engineer", imcaM117: "DP Systems", stcw: "STCW III/2", simulator: "N/A", experience: "Familiarização PMS" },
  { role: "ETO", imcaM117: "DP Electrical", stcw: "STCW III/6", simulator: "N/A", experience: "Sistemas DP" },
  { role: "Master", imcaM117: "DP Authority", stcw: "STCW II/2", simulator: "Overview", experience: "DP Command" },
];

export function IMCADPCompetencyMatrix({ selectedDPClass }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Matriz de Competência DP - IMCA M117
        </CardTitle>
        <CardDescription>Requisitos de competência para pessoal chave de DP ({selectedDPClass})</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Função</TableHead>
              <TableHead>IMCA M117</TableHead>
              <TableHead>STCW</TableHead>
              <TableHead>Simulador</TableHead>
              <TableHead>Experiência</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {competencyRequirements.map((req, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{req.role}</TableCell>
                <TableCell><Badge variant="outline">{req.imcaM117}</Badge></TableCell>
                <TableCell>{req.stcw}</TableCell>
                <TableCell>{req.simulator}</TableCell>
                <TableCell>{req.experience}</TableCell>
                <TableCell>
                  {i < 2 ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-amber-500" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
