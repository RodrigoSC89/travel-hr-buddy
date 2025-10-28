/**
 * PATCH 446 - Crew Consolidation Validation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Users, Award, Calendar, FileText } from "lucide-react";
import { useState } from "react";

export default function CrewConsolidationValidation() {
  const [checks, setChecks] = useState({
    unified: false,
    certifications: false,
    reviews: false,
    noDuplicates: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            PATCH 446 - Crew Consolidation
          </h1>
          <p className="text-muted-foreground mt-2">
            Validação do módulo unificado de gestão de tripulação
          </p>
        </div>
        {allChecked && (
          <Badge className="bg-green-500 text-white text-lg px-4 py-2">
            <CheckCircle2 className="h-5 w-5 mr-2" />
            VALIDADO
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Checklist de Validação</CardTitle>
          <CardDescription>
            Marque cada item após validar o funcionamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="unified"
              checked={checks.unified}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, unified: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="unified"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Users className="inline h-4 w-4 mr-1" />
                Apenas um módulo /crew-management ativo
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Módulo único consolidado sem duplicações
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="certifications"
              checked={checks.certifications}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, certifications: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="certifications"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Award className="inline h-4 w-4 mr-1" />
                Certificações e escalas funcionando
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema de certificações e rotações operacional
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="reviews"
              checked={checks.reviews}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, reviews: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="reviews"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Calendar className="inline h-4 w-4 mr-1" />
                Histórico de reviews disponível
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Avaliações de performance acessíveis e organizadas
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              id="noDuplicates"
              checked={checks.noDuplicates}
              onCheckedChange={(checked) =>
                setChecks({ ...checks, noDuplicates: checked as boolean })
              }
            />
            <div className="flex-1">
              <label
                htmlFor="noDuplicates"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <FileText className="inline h-4 w-4 mr-1" />
                Nenhum código duplicado
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                Código limpo sem duplicações ou redundâncias
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-green-500/50 bg-green-500/5">
        <CardHeader>
          <CardTitle className="text-green-700 dark:text-green-400">
            Critério de Aprovação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium">
            ✅ Módulo unificado e funcional
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Todos os checkboxes acima devem estar marcados para aprovação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
