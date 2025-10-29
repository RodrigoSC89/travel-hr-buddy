import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Users, FileArchive, TestTube, BarChart3 } from "lucide-react";
import Patch561Validation from "@/modules/stress-test/validation/Patch561Validation";
import Patch562Validation from "@/modules/beta-users/validation/Patch562Validation";
import Patch563Validation from "@/modules/audit/validation/Patch563Validation";
import Patch564Validation from "@/modules/regression/validation/Patch564Validation";
import Patch565Validation from "@/modules/quality-dashboard/validation/Patch565Validation";

export default function Patches561To565ValidationPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Validação PATCHES 561-565</h1>
        <p className="text-muted-foreground">
          Validação de stress tests, beta users, auditoria, regressão e quality dashboard
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">PATCH 561</p>
              <p className="font-semibold">Stress Test</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">PATCH 562</p>
              <p className="font-semibold">Beta Users</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <FileArchive className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">PATCH 563</p>
              <p className="font-semibold">Auditoria</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <TestTube className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">PATCH 564</p>
              <p className="font-semibold">Regressão</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">PATCH 565</p>
              <p className="font-semibold">Quality Dashboard</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Validation Components */}
      <div className="space-y-6">
        <Patch561Validation />
        <Patch562Validation />
        <Patch563Validation />
        <Patch564Validation />
        <Patch565Validation />
      </div>

      {/* Footer */}
      <Card className="p-6 bg-muted/50">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h3 className="font-semibold mb-2">Status Geral: PATCHES 561-565</h3>
            <p className="text-sm text-muted-foreground">
              Validação completa do conjunto de patches de qualidade, teste e auditoria do sistema.
            </p>
          </div>
          <Badge variant="default" className="text-sm">
            5 Patches
          </Badge>
        </div>
      </Card>
    </div>
  );
}
