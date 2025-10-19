import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileCheck, TrendingUp, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

interface AuditScore {
  audit_type: string;
  predicted_score: number;
  pass_probability: number;
  readiness_level: string;
  simulated_at: string;
}

const AUDIT_TYPE_INFO = {
  petrobras: {
    name: "Petrobras",
    description: "HSE & Operational Compliance",
    color: "bg-green-500",
  },
  ibama: {
    name: "IBAMA",
    description: "Environmental Regulations",
    color: "bg-blue-500",
  },
  iso: {
    name: "ISO",
    description: "Quality Management Standards",
    color: "bg-purple-500",
  },
  imca: {
    name: "IMCA",
    description: "Marine Contractor Standards",
    color: "bg-orange-500",
  },
  ism: {
    name: "ISM",
    description: "International Safety Management",
    color: "bg-red-500",
  },
  sgso: {
    name: "SGSO",
    description: "Quality Safety Management System",
    color: "bg-indigo-500",
  },
};

export function NormativeScores() {
  const [vessels, setVessels] = useState<any[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<string>("");
  const [scores, setScores] = useState<AuditScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [averageScore, setAverageScore] = useState<number>(0);

  useEffect(() => {
    loadVessels();
  }, []);

  useEffect(() => {
    if (selectedVessel) {
      loadScores();
    }
  }, [selectedVessel]);

  const loadVessels = async () => {
    const { data } = await supabase
      .from("vessels")
      .select("id, name")
      .eq("status", "active")
      .order("name");
    
    if (data && data.length > 0) {
      setVessels(data);
      setSelectedVessel(data[0].id);
    }
  };

  const loadScores = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("audit_predictions")
        .select("audit_type, predicted_score, pass_probability, readiness_level, simulated_at")
        .eq("vessel_id", selectedVessel)
        .order("audit_type")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const latestScores: { [key: string]: AuditScore } = {};
      (data || []).forEach((item) => {
        if (!latestScores[item.audit_type]) {
          latestScores[item.audit_type] = item;
        }
      });

      const scoresArray = Object.values(latestScores);
      setScores(scoresArray);

      if (scoresArray.length > 0) {
        const avg = scoresArray.reduce((sum, s) => sum + s.predicted_score, 0) / scoresArray.length;
        setAverageScore(Math.round(avg));
      } else {
        setAverageScore(0);
      }
    } catch (error: any) {
      console.error("Error loading scores:", error);
    } finally {
      setLoading(false);
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

  const getScoreTrend = (score: number) => {
    if (score >= 75) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    }
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Normative Compliance Scores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="score-vessel">Vessel</Label>
              <Select value={selectedVessel} onValueChange={setSelectedVessel}>
                <SelectTrigger id="score-vessel">
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

            <div className="flex-1">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">
                  Average Score
                </div>
                <div className={`text-3xl font-bold ${getScoreColor(averageScore)}`}>
                  {averageScore}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              Loading scores...
            </div>
          </CardContent>
        </Card>
      ) : scores.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No audit predictions found for this vessel</p>
              <p className="text-sm mt-2">Run audit simulations to generate scores</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.keys(AUDIT_TYPE_INFO).map((auditType) => {
            const score = scores.find(s => s.audit_type === auditType);
            const info = AUDIT_TYPE_INFO[auditType as keyof typeof AUDIT_TYPE_INFO];

            return (
              <Card key={auditType}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{info.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {info.description}
                      </p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${info.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  {score ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className={`text-4xl font-bold ${getScoreColor(score.predicted_score)}`}>
                            {score.predicted_score}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            out of 100
                          </div>
                        </div>
                        {getScoreTrend(score.predicted_score)}
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Pass Probability</span>
                          <span className="font-semibold">
                            {(score.pass_probability * 100).toFixed(0)}%
                          </span>
                        </div>
                        <Progress value={score.pass_probability * 100} />
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-xs text-muted-foreground">
                          Readiness
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getReadinessColor(score.readiness_level)}`}
                        >
                          {score.readiness_level.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="text-xs text-muted-foreground text-center">
                        Last updated: {new Date(score.simulated_at).toLocaleDateString()}
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      No prediction available
                    </div>
                  )}\n                </CardContent>
              </Card>
            );
          })}\n        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Score Interpretation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-semibold text-green-600">85-100</div>
              <div className="text-xs text-muted-foreground">Excellent</div>
            </div>
            <div>
              <div className="font-semibold text-blue-600">75-84</div>
              <div className="text-xs text-muted-foreground">High</div>
            </div>
            <div>
              <div className="font-semibold text-yellow-600">60-74</div>
              <div className="text-xs text-muted-foreground">Medium</div>
            </div>
            <div>
              <div className="font-semibold text-red-600">0-59</div>
              <div className="text-xs text-muted-foreground">Low</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
