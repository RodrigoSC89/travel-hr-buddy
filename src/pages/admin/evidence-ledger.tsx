/**
 * PATCH 630 - Evidence Ledger Interface
 * Admin interface for viewing and managing the immutable evidence ledger
 */

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Shield,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Download,
  Search,
  Lock,
  Hash,
  Clock,
  User,
  Layers
} from "lucide-react";
import {
  getLedgerSummary,
  queryLedger,
  verifyLedgerIntegrity,
  seedDemoEvidence,
  exportLedger,
  getEvidenceEntry,
  type EvidenceEntry,
  type LedgerSummary
} from "@/lib/compliance/evidence-ledger";
import { logger } from "@/lib/logger";

export default function EvidenceLedgerPage() {
  const [summary, setSummary] = useState<LedgerSummary | null>(null);
  const [entries, setEntries] = useState<EvidenceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<EvidenceEntry | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [integrityResult, setIntegrityResult] = useState<any>(null);

  // Filter state
  const [filterEventType, setFilterEventType] = useState<string>("");
  const [filterModule, setFilterModule] = useState<string>("");

  const loadData = async () => {
    setLoading(true);
    try {
      // Seed demo data if ledger is empty
      const initialSummary = await getLedgerSummary();
      if (initialSummary.totalBlocks <= 1) {
        await seedDemoEvidence();
      }

      const [summaryData, entriesData] = await Promise.all([
        getLedgerSummary(),
        queryLedger({ limit: 100 })
      ]);

      setSummary(summaryData);
      setEntries(entriesData);
    } catch (error) {
      logger.error("Error loading ledger data", { error });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyIntegrity = async () => {
    setVerifying(true);
    try {
      const result = await verifyLedgerIntegrity();
      setIntegrityResult(result);
    } catch (error) {
      logger.error("Error verifying integrity", { error });
    } finally {
      setVerifying(false);
    }
  };

  const handleExport = () => {
    const data = exportLedger();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `evidence-ledger-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const applyFilters = async () => {
    const filters: any = {};
    if (filterEventType) filters.eventType = filterEventType;
    if (filterModule) filters.moduleId = filterModule;
    filters.limit = 100;

    const filtered = await queryLedger(filters);
    setEntries(filtered);
  };

  const clearFilters = async () => {
    setFilterEventType("");
    setFilterModule("");
    const allEntries = await queryLedger({ limit: 100 });
    setEntries(allEntries);
  };

  useEffect(() => {
    loadData();
  }, []);

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      inspection: "bg-blue-100 text-blue-800",
      audit: "bg-purple-100 text-purple-800",
      correction: "bg-yellow-100 text-yellow-800",
      checklist: "bg-green-100 text-green-800",
      incident: "bg-red-100 text-red-800",
      training: "bg-indigo-100 text-indigo-800"
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Lock className="h-12 w-12 animate-pulse mx-auto mb-4 text-blue-600" />
          <p className="text-lg">Loading Evidence Ledger...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Evidence Ledger
          </h1>
          <p className="text-muted-foreground mt-1">
            Cryptographic immutable audit trail for compliance evidence
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleVerifyIntegrity} disabled={verifying} variant="outline">
            <CheckCircle2 className={`h-4 w-4 mr-2 ${verifying ? "animate-spin" : ""}`} />
            Verify Integrity
          </Button>
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Integrity Alert */}
      {integrityResult && (
        <Alert variant={integrityResult.isValid ? "default" : "destructive"}>
          {integrityResult.isValid ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          <AlertTitle>
            {integrityResult.isValid ? "Ledger Verified" : "Integrity Issue Detected"}
          </AlertTitle>
          <AlertDescription>{integrityResult.message}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Total Blocks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.totalBlocks}</div>
              <p className="text-xs text-muted-foreground mt-1">Immutable entries</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Events Recorded
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {Object.values(summary.totalEvents).reduce((a, b) => a + b, 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Across all types</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Integrity Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                variant={summary.integrityStatus === "verified" ? "default" : "destructive"}
                className="text-lg"
              >
                {summary.integrityStatus}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">Hash chain validated</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Last Entry
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">
                {new Date(summary.lastBlock).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Most recent block</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Event Type Distribution */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Event Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(summary.totalEvents).map(([type, count]) => (
                <Badge key={type} className={getEventTypeColor(type)}>
                  {type}: {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filter Evidence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Event Type</Label>
              <Select value={filterEventType || "all"} onValueChange={(value) => setFilterEventType(value === "all" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                  <SelectItem value="audit">Audit</SelectItem>
                  <SelectItem value="correction">Correction</SelectItem>
                  <SelectItem value="checklist">Checklist</SelectItem>
                  <SelectItem value="incident">Incident</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Module ID</Label>
              <Input
                value={filterModule}
                onChange={(e) => setFilterModule(e.target.value)}
                placeholder="e.g., ism-code"
              />
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={applyFilters} className="flex-1">Apply</Button>
              <Button onClick={clearFilters} variant="outline">Clear</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Evidence Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Evidence Chain</CardTitle>
          <CardDescription>{entries.length} entries found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="border rounded-lg p-4 hover:bg-accent cursor-pointer transition-colors"
                onClick={() => setSelectedEntry(entry)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getEventTypeColor(entry.eventType)}>
                      {entry.eventType}
                    </Badge>
                    <span className="font-semibold">{entry.moduleName}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Block #{entry.blockNumber}
                  </span>
                </div>

                <p className="text-sm mb-2">{entry.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(entry.timestamp).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {entry.originator}
                  </div>
                  <div className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    {entry.hash.substring(0, 16)}...
                  </div>
                  <div className="flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Signed
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Entry Detail Dialog */}
      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Evidence Block #{selectedEntry?.blockNumber}
            </DialogTitle>
            <DialogDescription>Complete evidence entry details</DialogDescription>
          </DialogHeader>

          {selectedEntry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Event Type</Label>
                  <Badge className={getEventTypeColor(selectedEntry.eventType)}>
                    {selectedEntry.eventType}
                  </Badge>
                </div>
                <div>
                  <Label>Module</Label>
                  <p className="text-sm font-medium">{selectedEntry.moduleName}</p>
                </div>
                <div>
                  <Label>Originator</Label>
                  <p className="text-sm">{selectedEntry.originator}</p>
                </div>
                <div>
                  <Label>Timestamp</Label>
                  <p className="text-sm">{new Date(selectedEntry.timestamp).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <p className="text-sm mt-1">{selectedEntry.description}</p>
              </div>

              <div>
                <Label>Event Data</Label>
                <pre className="bg-muted p-3 rounded text-xs overflow-x-auto mt-1">
                  {JSON.stringify(selectedEntry.data, null, 2)}
                </pre>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Block Hash</Label>
                  <p className="text-xs font-mono bg-muted p-2 rounded mt-1 break-all">
                    {selectedEntry.hash}
                  </p>
                </div>
                <div>
                  <Label>Previous Hash</Label>
                  <p className="text-xs font-mono bg-muted p-2 rounded mt-1 break-all">
                    {selectedEntry.previousHash}
                  </p>
                </div>
              </div>

              <div>
                <Label>Digital Signature</Label>
                <p className="text-xs font-mono bg-muted p-2 rounded mt-1 break-all">
                  {selectedEntry.signature}
                </p>
              </div>

              {selectedEntry.metadata && (
                <div>
                  <Label>Metadata</Label>
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto mt-1">
                    {JSON.stringify(selectedEntry.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
