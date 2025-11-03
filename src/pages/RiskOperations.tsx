// PATCH 600: Risk Operations Page
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Download, TrendingUp, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RiskOpsService } from '@/services/risk-ops.service';
import type { RiskOperation, RiskStatistics, RiskHeatmapCell } from '@/types/risk-ops';
import { toast } from 'sonner';

const RiskOperations: React.FC = () => {
  const [risks, setRisks] = useState<RiskOperation[]>([]);
  const [stats, setStats] = useState<RiskStatistics | null>(null);
  const [heatmap, setHeatmap] = useState<RiskHeatmapCell[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [risksData, statsData, heatmapData] = await Promise.all([
        RiskOpsService.getRisks(),
        RiskOpsService.getRiskStatistics(),
        RiskOpsService.getRiskHeatmap(),
      ]);
      setRisks(risksData);
      setStats(statsData);
      setHeatmap(heatmapData);
    } catch (error) {
      console.error('Error loading risk data:', error);
      toast.error('Failed to load risk data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportJSON = async () => {
    try {
      const json = await RiskOpsService.exportToJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `risks-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Exported to JSON');
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Failed to export');
    }
  };

  const handleExportCSV = async () => {
    try {
      const csv = await RiskOpsService.exportToCSV();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `risks-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Exported to CSV');
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Failed to export');
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 75) return 'text-red-600';
    if (score >= 50) return 'text-orange-600';
    if (score >= 25) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Risk Operations AI
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive risk analysis and management
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportJSON}>
            <Download className="h-4 w-4 mr-2" />
            JSON
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Risks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_risks || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {stats?.open_risks || 0} open
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Critical Risks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.critical_risks || 0}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {stats?.high_risks || 0} high severity
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Avg. Risk Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(stats?.average_risk_score || 0)}`}>
              {stats?.average_risk_score ? stats.average_risk_score.toFixed(1) : '0'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.total_risks ? ((stats.closed_risks / stats.total_risks) * 100).toFixed(0) : '0'}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {stats?.closed_risks || 0} resolved
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Heatmap</CardTitle>
          <CardDescription>Risk distribution by severity and likelihood</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            <div className="text-xs font-semibold"></div>
            <div className="text-xs font-semibold text-center">Unlikely</div>
            <div className="text-xs font-semibold text-center">Possible</div>
            <div className="text-xs font-semibold text-center">Likely</div>
            <div className="text-xs font-semibold text-center">Almost Certain</div>

            {['critical', 'high', 'medium', 'low'].map(severity => (
              <>
                <div className="text-xs font-semibold flex items-center">{severity}</div>
                {['unlikely', 'possible', 'likely', 'almost_certain'].map(likelihood => {
                  const cell = heatmap.find(
                    h => h.severity === severity && h.likelihood === likelihood
                  );
                  const intensity = cell ? Math.min(cell.count * 20, 100) : 0;
                  return (
                    <div
                      key={`${severity}-${likelihood}`}
                      className="h-16 rounded flex items-center justify-center text-sm font-bold"
                      style={{
                        backgroundColor: `rgba(239, 68, 68, ${intensity / 100})`,
                        color: intensity > 50 ? 'white' : 'black'
                      }}
                    >
                      {cell?.count || 0}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risks List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Risks</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading risks...</p>
            </div>
          ) : risks.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No risks found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {risks.slice(0, 10).map((risk) => (
                <div key={risk.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-semibold">{risk.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {risk.description}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{risk.module}</Badge>
                      <Badge variant={getSeverityColor(risk.severity)}>
                        {risk.severity}
                      </Badge>
                      <Badge variant="secondary">{risk.risk_type}</Badge>
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${getScoreColor(risk.risk_score)}`}>
                    {risk.risk_score.toFixed(0)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskOperations;
