/**
 * MARPOL Compliance Tracker - World-Class Maritime Environmental Compliance
 * Refactored: orchestrator pattern with extracted sub-components
 */
import { useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShipLoader } from "@/components/ui/ship-loader";
import { Leaf, Activity, RefreshCw, FileText } from "lucide-react";
import { toast } from "sonner";
import { useMARPOLData } from "./marpol/useMARPOLData";
import { MARPOLTabs } from "./marpol/MARPOLTabs";
import { exportToCSV, type ComplianceScores } from "./marpol/types";

const MARPOLTrackerPage = () => {
  const { compliance, wasteLogs, emissions, tanks, alerts, vessels, isLoading, refetch } = useMARPOLData();

  const scores = (compliance?.scores || { overall: 0, annexI: 0, annexII: 0, annexIII: 0, annexIV: 0, annexV: 0, annexVI: 0 }) as ComplianceScores;
  const emissionsData = emissions || { sox: 0, nox: 0, co2: 0, pm: 0, fuelType: "VLSFO", sulphurContent: 0.50 };

  const handleExportORB = useCallback(() => {
    const orbLogs = wasteLogs.filter((l) => l.recordBook === "ORB" || l.type.toLowerCase().includes("oil") || l.type.toLowerCase().includes("óleo"));
    const dataToExport = (orbLogs.length > 0 ? orbLogs : wasteLogs) as unknown as Record<string, unknown>[];
    exportToCSV(dataToExport, "e-ORB_OilRecordBook");
    toast.success("e-ORB exportado com sucesso");
  }, [wasteLogs]);

  const handleExportGRB = useCallback(() => {
    const grbLogs = wasteLogs.filter((l) => l.recordBook === "GRB" || l.type.toLowerCase().includes("garbage") || l.type.toLowerCase().includes("lixo"));
    const dataToExport = (grbLogs.length > 0 ? grbLogs : wasteLogs) as unknown as Record<string, unknown>[];
    exportToCSV(dataToExport, "e-GRB_GarbageRecordBook");
    toast.success("e-GRB exportado com sucesso");
  }, [wasteLogs]);

  if (isLoading) return <ShipLoader size="lg" className="h-96" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-xl bg-success/10">
              <Leaf className="h-7 w-7 text-success" />
            </div>
            MARPOL Compliance Tracker
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitoramento ambiental completo • Anexos I-VI • e-ORB & e-GRB • AI Analytics
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="gap-2 py-1.5 px-3">
            <Activity className="h-3.5 w-3.5 text-success animate-pulse" />
            Monitoramento Ativo
          </Badge>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />Atualizar
          </Button>
          <Button size="sm">
            <FileText className="h-4 w-4 mr-2" />Relatório MARPOL
          </Button>
        </div>
      </div>

      <MARPOLTabs
        scores={scores}
        wasteLogs={wasteLogs}
        emissionsData={emissionsData}
        tanks={tanks}
        alerts={alerts}
        vessels={vessels}
        refetch={refetch}
        onExportORB={handleExportORB}
        onExportGRB={handleExportGRB}
      />
    </div>
  );
};

export default MARPOLTrackerPage;
