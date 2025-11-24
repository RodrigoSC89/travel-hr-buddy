/**
 * PATCH 598 - Training Progress Dashboard
 * Displays crew training progress and metrics
 */

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getTrainingProgress } from "@/services/ai-training-engine";
import type { LearningProgress } from "./types";
import type { Database } from "@/integrations/supabase/types";

interface TrainingDashboardProps {
  crewMemberId: string;
}

type CrewLearningProgressRow = Database["public"]["Tables"]["crew_learning_progress"]["Row"];

type ProgressMetadata = Partial<{
  totalQuizzesTaken: number;
  totalQuizzesPassed: number;
  averageScore: number;
  lastUpdatedAt: string;
  improvementRate: number;
  weakAreas: string[];
  strongAreas: string[];
}>;

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const toNumber = (value: unknown): number | undefined => {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
};

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
};

const extractProgressMetadata = (payload: CrewLearningProgressRow["completed_modules"]): ProgressMetadata => {
  if (!isRecord(payload)) {
    return {};
  }

  return payload as ProgressMetadata;
};

const mapRowToLearningProgress = (row: CrewLearningProgressRow): LearningProgress => {
  const metadata = extractProgressMetadata(row.completed_modules);

  const totalQuizzesTaken = toNumber(metadata.totalQuizzesTaken) ?? 0;
  const totalQuizzesPassed = toNumber(metadata.totalQuizzesPassed) ?? 0;
  const averageScore = toNumber(metadata.averageScore) ?? row.progress_percentage ?? 0;
  const improvementRate = toNumber(metadata.improvementRate) ?? 0;
  const weakAreas = toStringArray(metadata.weakAreas);
  const strongAreas = toStringArray(metadata.strongAreas);
  const lastTrainingDate =
    typeof metadata.lastUpdatedAt === "string" && metadata.lastUpdatedAt
      ? metadata.lastUpdatedAt
      : row.last_activity_at ?? row.updated_at ?? row.created_at ?? new Date().toISOString();

  return {
    moduleType: row.topic,
    totalQuizzesTaken,
    totalQuizzesPassed,
    averageScore,
    lastTrainingDate,
    improvementRate,
    weakAreas,
    strongAreas,
  };
};

export default function TrainingDashboard({ crewMemberId }: TrainingDashboardProps) {
  const [progress, setProgress] = useState<LearningProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, [crewMemberId]);

  const loadProgress = async () => {
    try {
      const data = await getTrainingProgress(crewMemberId);
      const normalized = data.map(mapRowToLearningProgress);
      setProgress(normalized);
    } catch (error) {
      console.error("Error loading progress:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading training progress...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Crew Training Progress</h2>
        <p className="text-muted-foreground">
          Track learning progress across all compliance modules
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {progress.map((item) => (
          <Card key={item.moduleType}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {item.moduleType}
                <Badge variant={item.averageScore >= 70 ? "default" : "destructive"}>
                  {item.averageScore.toFixed(0)}%
                </Badge>
              </CardTitle>
              <CardDescription>
                {item.totalQuizzesPassed} / {item.totalQuizzesTaken} quizzes passed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span className="font-medium">{item.averageScore.toFixed(1)}%</span>
                </div>
                <Progress value={item.averageScore} className="h-2" />
              </div>

              {item.weakAreas && item.weakAreas.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Areas to Improve:</p>
                  <div className="flex flex-wrap gap-1">
                    {item.weakAreas.map((area, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {item.strongAreas && item.strongAreas.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Strong Areas:</p>
                  <div className="flex flex-wrap gap-1">
                    {item.strongAreas.map((area, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {item.lastTrainingDate && (
                <p className="text-xs text-muted-foreground">
                  Last training: {new Date(item.lastTrainingDate).toLocaleDateString()}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {progress.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No training data available yet.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Complete your first quiz to start tracking progress.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
