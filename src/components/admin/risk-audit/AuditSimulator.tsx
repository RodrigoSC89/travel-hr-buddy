import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Shield, Play, TrendingUp, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

interface AuditPrediction {
  id: string;
  vessel_id: string;
  audit_type: string;
  predicted_score: number;
  pass_probability: number;
  readiness_level: string;
  weaknesses: string[];
  recommendations: string[];
  compliance_gaps: string[];
  simulated_at: string;
  simulated_by: string;
}

const AUDIT_TYPES = [
  { value: "petrobras", label: "Petrobras (HSE & Operational)" },
  { value: "ibama", label: "IBAMA (Environmental)" },
  { value: "iso", label: "ISO (Quality Management)" },
  { value: "imca", label: "IMCA (Marine Standards)" },
  { value: "ism", label: "ISM (Safety Management)" },
  { value: "sgso", label: "SGSO (QSMS)" },
];

export function AuditSimulator() {
  const [vessels, setVessels] = useState<any[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<string>("");
  const [selectedAuditType, setSelectedAuditType] = useState<string>("");
  const [simulating, setSimulating] = useState(false);
  const [prediction, setPrediction] = useState<AuditPrediction | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVessels();
  }, []);

  useEffect(() => {
    if (selectedVessel && selectedAuditType) {
      loadLatestPrediction();
    }
  }, [selectedVessel, selectedAuditType]);

  const loadVessels = async () => {
    const { data } = await supabase
      .from("vessels")
      .select("id, name")
      .eq("status", "active")
      .order("name");
    
    if (data) setVessels(data);
  };

  const loadLatestPrediction = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("audit_predictions")
        .select("*")
        .eq("vessel_id", selectedVessel)
        .eq("audit_type", selectedAuditType)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setPrediction(data);
    } catch (error: any) {
      console.error("Error loading prediction:", error);
    } finally {
      setLoading(false);
    }
  };

  const runSimulation = async () => {
    if (!selectedVessel || !selectedAuditType) {
      toast.error("Please select both vessel and audit type");
      return;
    }

    setSimulating(true);
    try {
      const response = await fetch("/api/audit/score-predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vessel_id: selectedVessel,
          audit_type: selectedAuditType,
        }),
      });

      if (!response.ok) throw new Error("Simulation failed");

      const result = await response.json();
      toast.success("Audit simulation completed");
      setPrediction(result.prediction);
    } catch (error) {
      console.error("Simulation error:", error);
      toast.error("Failed to run audit simulation");
    } finally {
      setSimulating(false);
    }
  };

  const getReadinessColor = (level: string) => {
    switch (level) {
      case "excellent": return "text-green-600";
      case "high": return "text-blue-600";
      case "medium": return "text-yellow-600";
      case "low": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 75) return "text-blue-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-4">
      {/* Simulator Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Audit Outcome Simulator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="sim-vessel">Vessel</Label>
              <Select value={selectedVessel} onValueChange={setSelectedVessel}>
                <SelectTrigger id="sim-vessel">
                  <SelectValue placeholder="Select vessel" />
                </SelectTrigger>
                <SelectContent>
                  {vessels.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="audit-type">Audit Type</Label>
              <Select value={selectedAuditType} onValueChange={setSelectedAuditType}>
                <SelectTrigger id="audit-type">
                  <SelectValue placeholder="Select audit type" />
                </SelectTrigger>
                <SelectContent>
                  {AUDIT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={runSimulation}
                disabled={simulating || !selectedVessel || !selectedAuditType}
                className="w-full gap-2"
              >
                <Play className={`h-4 w-4 ${simulating ? 'animate-pulse' : ''}`} />
                {simulating ? "Simulating..." : "Run Simulation"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prediction Results */}
      {loading ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              Loading prediction...
            </div>
          </CardContent>
        </Card>
      ) : prediction ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Score Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Predicted Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className={`text-6xl font-bold ${getScoreColor(prediction.predicted_score)}`}>
                    {prediction.predicted_score}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    out of 100
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Pass Probability</span>
                    <span className="font-bold">
                      {(prediction.pass_probability * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={prediction.pass_probability * 100} />
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm text-muted-foreground">
                    Readiness Level
                  </span>
                  <Badge
                    variant="outline"
                    className={getReadinessColor(prediction.readiness_level)}
                  >
                    {prediction.readiness_level.toUpperCase()}
                  </Badge>
                </div>

                <div className="text-xs text-muted-foreground text-center pt-2">
                  Simulated: {new Date(prediction.simulated_at).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Weaknesses */}
                {prediction.weaknesses && prediction.weaknesses.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                      Identified Weaknesses
                    </h4>
                    <ul className="space-y-1 text-sm">
                      {prediction.weaknesses.map((w, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-muted-foreground">•</span>
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Compliance Gaps */}
                {prediction.compliance_gaps && prediction.compliance_gaps.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">
                      Compliance Gaps
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {prediction.compliance_gaps.map((gap, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {gap}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          {prediction.recommendations && prediction.recommendations.length > 0 && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {prediction.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        {i + 1}
                      </span>
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Select a vessel and audit type, then run simulation</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
