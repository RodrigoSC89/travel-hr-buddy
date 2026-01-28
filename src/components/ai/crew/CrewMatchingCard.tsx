/**
 * Crew Matching Card - Shows AI crew-vessel matching results
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Users, Star, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MatchResult {
  candidateId: string;
  candidateName: string;
  overallScore: number;
  dimensionScores: {
    certifications: number;
    experience: number;
    availability: number;
    skills: number;
    compatibility: number;
  };
  strengths: string[];
  gaps: string[];
  recommendation: 'highly_recommended' | 'recommended' | 'acceptable' | 'not_recommended';
}

interface CrewMatchingCardProps {
  match?: MatchResult;
  isLoading?: boolean;
  className?: string;
}

const RECOMMENDATION_STYLES = {
  highly_recommended: { color: 'text-green-500', bg: 'bg-green-500/10', label: 'Altamente Recomendado' },
  recommended: { color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Recomendado' },
  acceptable: { color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Aceitável' },
  not_recommended: { color: 'text-red-500', bg: 'bg-red-500/10', label: 'Não Recomendado' },
};

export function CrewMatchingCard({ match, isLoading, className }: CrewMatchingCardProps) {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-8 bg-muted rounded w-1/2" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-3 bg-muted rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!match) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Selecione um candidato e posição para análise</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const recStyle = RECOMMENDATION_STYLES[match.recommendation];

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{match.candidateName}</CardTitle>
            <CardDescription>Análise de Compatibilidade AI</CardDescription>
          </div>
          <Badge className={cn(recStyle.bg, recStyle.color, "border-0")}>
            {recStyle.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div className="text-center py-4">
          <div className={cn(
            "text-5xl font-bold",
            match.overallScore >= 80 ? "text-green-500" :
            match.overallScore >= 60 ? "text-yellow-500" : "text-red-500"
          )}>
            {match.overallScore}%
          </div>
          <p className="text-sm text-muted-foreground">Score Geral</p>
        </div>

        {/* Dimension Scores */}
        <div className="space-y-3">
          {Object.entries(match.dimensionScores).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="capitalize">{key.replace('_', ' ')}</span>
                <span>{value}%</span>
              </div>
              <Progress value={value} className="h-2" />
            </div>
          ))}
        </div>

        {/* Strengths & Gaps */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <p className="text-sm font-medium flex items-center gap-1 mb-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Pontos Fortes
            </p>
            <ul className="text-xs space-y-1">
              {match.strengths.slice(0, 3).map((s, i) => (
                <li key={i} className="text-muted-foreground">• {s}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium flex items-center gap-1 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Lacunas
            </p>
            <ul className="text-xs space-y-1">
              {match.gaps.slice(0, 3).map((g, i) => (
                <li key={i} className="text-muted-foreground">• {g}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CrewMatchingCard;
