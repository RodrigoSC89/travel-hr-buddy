import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Loader2,
  Lightbulb,
  Shield
} from 'lucide-react';
import type { LSAFFAInspection, AIAnalysisResponse, RiskRating } from './types';

interface LSAFFAInsightAIProps {
  inspection: LSAFFAInspection;
  onAnalysisComplete?: (analysis: AIAnalysisResponse) => void;
}

export const LSAFFAInsightAI: React.FC<LSAFFAInsightAIProps> = ({
  inspection,
  onAnalysisComplete,
}) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getRiskColor = (rating?: RiskRating) => {
    switch (rating) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (rating?: RiskRating) => {
    switch (rating) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-5 w-5" />;
      case 'medium':
        return <Shield className="h-5 w-5" />;
      case 'low':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Brain className="h-5 w-5" />;
    }
  };

  const analyzeInspection = async () => {
    setAnalyzing(true);
    setError(null);

    try {
      // Simulate AI analysis - in production, this would call an AI service
      // For now, we'll generate insights based on the inspection data
      const totalItems = inspection.checklist.length;
      const failedItems = inspection.checklist.filter(item => !item.checked).length;
      const issuesCount = inspection.issues_found.length;
      const criticalIssues = inspection.issues_found.filter(
        issue => issue.severity === 'critical'
      ).length;

      // Generate AI insights based on inspection data
      let riskRating: RiskRating = 'low';
      if (criticalIssues > 0 || inspection.score < 50) {
        riskRating = 'critical';
      } else if (inspection.score < 70 || issuesCount > 3) {
        riskRating = 'high';
      } else if (inspection.score < 85 || issuesCount > 0) {
        riskRating = 'medium';
      }

      const suggestions: string[] = [];
      
      if (failedItems > 0) {
        suggestions.push(
          `${failedItems} checklist item${failedItems > 1 ? 's' : ''} failed inspection. Immediate attention required.`
        );
      }

      if (inspection.type === 'LSA') {
        if (inspection.score < 100) {
          suggestions.push('Schedule lifeboat drill and ensure all crew members are familiar with LSA equipment.');
        }
        suggestions.push('Verify all lifesaving appliances are within their certification dates.');
        suggestions.push('Review SOLAS III/20 requirements for weekly and monthly maintenance.');
      } else if (inspection.type === 'FFA') {
        if (inspection.score < 100) {
          suggestions.push('Conduct fire drill to ensure crew readiness and verify all FFA equipment is operational.');
        }
        suggestions.push('Check fire extinguisher service dates and replace any expired units.');
        suggestions.push('Test emergency fire pump and ensure water pressure meets SOLAS requirements.');
      }

      if (criticalIssues > 0) {
        suggestions.push('⚠️ Critical safety issues detected. Vessel may not be seaworthy until resolved.');
      }

      const summary = `
AI Analysis for ${inspection.type} Inspection:

Compliance Score: ${inspection.score}%
Risk Level: ${riskRating.toUpperCase()}
Issues Found: ${issuesCount} (${criticalIssues} critical)

Based on SOLAS Chapter III Regulation 20 and MSC/Circ.1093 requirements, this inspection 
${inspection.score >= 85 ? 'meets' : 'does not meet'} the minimum compliance standards. 
${criticalIssues > 0 ? 'Critical deficiencies require immediate corrective action before vessel operations.' : ''}
${inspection.score < 100 ? 'Recommend scheduling follow-up inspection within 30 days.' : 'Equipment is in good operational condition.'}
      `.trim();

      const analysisResult: AIAnalysisResponse = {
        summary,
        risk_rating: riskRating,
        suggestions,
        predicted_issues: [],
        compliance_score: inspection.score,
      };

      setAnalysis(analysisResult);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(analysisResult);
      }
    } catch (err) {
      console.error('AI Analysis error:', err);
      setError('Failed to analyze inspection. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle>AI Insights & Analysis</CardTitle>
          </div>
          <Button
            onClick={analyzeInspection}
            disabled={analyzing}
            size="sm"
          >
            {analyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Analyze Inspection
              </>
            )}
          </Button>
        </div>
        <CardDescription>
          AI-powered analysis based on SOLAS regulations and historical data
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {analysis && (
          <>
            {/* Risk Rating Badge */}
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${getRiskColor(analysis.risk_rating)}`}>
                {getRiskIcon(analysis.risk_rating)}
                <div>
                  <div className="text-xs font-medium uppercase">Risk Level</div>
                  <div className="text-lg font-bold">{analysis.risk_rating}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-blue-50 border-blue-200 text-blue-600">
                <TrendingUp className="h-5 w-5" />
                <div>
                  <div className="text-xs font-medium">Compliance Score</div>
                  <div className="text-lg font-bold">{analysis.compliance_score}%</div>
                </div>
              </div>
            </div>

            {/* AI Summary */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Executive Summary
              </h4>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {analysis.summary}
              </p>
            </div>

            {/* AI Suggestions */}
            {analysis.suggestions.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-600" />
                  AI Recommendations
                </h4>
                <div className="space-y-2">
                  {analysis.suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                    >
                      <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-blue-900">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SOLAS Compliance Note */}
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription className="text-xs">
                This AI analysis is based on SOLAS Chapter III Regulation 20, MSC/Circ.1093, 
                and MSC/Circ.1206 requirements. All recommendations should be reviewed by a 
                qualified marine surveyor or safety officer.
              </AlertDescription>
            </Alert>
          </>
        )}

        {!analysis && !analyzing && (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">
              Click "Analyze Inspection" to get AI-powered insights and recommendations
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
