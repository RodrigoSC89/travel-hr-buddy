/**
 * PATCH 547 – Trust Score Display Component
 * UI component to show trust score with color and tooltip
 */

import React, { useEffect, useState } from "react";
import { Shield, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getTrustScoreInfo, getTrustHistory } from "@/ai/trust-engine";

interface TrustScoreDisplayProps {
  entityId: string;
  score: number;
  showHistory?: boolean;
}

export const TrustScoreDisplay: React.FC<TrustScoreDisplayProps> = ({
  entityId,
  score,
  showHistory = false,
}) => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const scoreInfo = getTrustScoreInfo(score);

  useEffect(() => {
    if (showHistory) {
      loadHistory();
    }
  }, [entityId, showHistory]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await getTrustHistory(entityId, 10);
      setHistory(data);
    } catch (error) {
      console.error("Error loading trust history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = () => {
    if (history.length < 2) return null;

    const latestScore = history[0]?.trust_score_after || score;
    const previousScore = history[1]?.trust_score_after || score;

    if (latestScore > previousScore) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (latestScore < previousScore) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="p-4 cursor-help hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <Shield className={`h-8 w-8 ${scoreInfo.color}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${scoreInfo.color}`}>
                      {scoreInfo.score}
                    </span>
                    <span className="text-sm text-muted-foreground">/100</span>
                    {getTrendIcon()}
                  </div>
                  <p className={`text-sm font-medium ${scoreInfo.color}`}>
                    {scoreInfo.label}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${scoreInfo.color.replace(
                    "text-",
                    "bg-"
                  )} transition-all duration-500`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>{scoreInfo.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {showHistory && history.length > 0 && (
        <Card className="p-4">
          <h4 className="text-sm font-semibold mb-3">Histórico Recente</h4>
          <div className="space-y-2">
            {history.slice(0, 5).map((event, idx) => (
              <div
                key={event.id || idx}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-muted-foreground">
                  {event.event_type}
                </span>
                <div className="flex items-center gap-2">
                  <span>{event.trust_score_before.toFixed(1)}</span>
                  <span>→</span>
                  <span className="font-medium">
                    {event.trust_score_after.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
