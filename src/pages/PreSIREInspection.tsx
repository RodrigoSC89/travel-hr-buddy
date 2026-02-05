/**
 * Pre-SIRE 2.0 Inspection Page
 * OCIMF Ship Inspection Report Programme v2.0
 */
import type { FC } from 'react';
import { useState } from 'react';
import { ModulePageWrapper } from '@/components/ui/module-page-wrapper';
import { ModuleHeader } from '@/components/ui/module-header';
import { Ship, FileCheck, Brain, ClipboardCheck, AlertTriangle, CheckCircle2, Clock, BarChart3, Target, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const PreSIREInspection: FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock data for SIRE 2.0 inspection
  const sireCategories = [
    { id: 'nav', name: 'Navigation', questions: 127, completed: 98, score: 87 },
    { id: 'cargo', name: 'Cargo Operations', questions: 156, completed: 134, score: 92 },
    { id: 'mooring', name: 'Mooring', questions: 89, completed: 89, score: 95 },
    { id: 'safety', name: 'Safety Management', questions: 203, completed: 178, score: 88 },
    { id: 'pollution', name: 'Pollution Prevention', questions: 112, completed: 98, score: 91 },
    { id: 'crew', name: 'Crew Management', questions: 78, completed: 72, score: 94 },
    { id: 'structural', name: 'Structural Condition', questions: 145, completed: 123, score: 85 },
    { id: 'engine', name: 'Engine Room', questions: 167, completed: 145, score: 89 },
  ];

  const recentInspections = [
    { vessel: 'MV Atlantic Pioneer', date: '2026-01-28', score: 91, status: 'approved' },
    { vessel: 'MT Pacific Spirit', date: '2026-01-15', score: 88, status: 'pending' },
    { vessel: 'MV Ocean Voyager', date: '2026-01-02', score: 94, status: 'approved' },
  ];

  const overallScore = Math.round(sireCategories.reduce((acc, cat) => acc + cat.score, 0) / sireCategories.length);

  return (
    <ModulePageWrapper gradient="purple">
      <ModuleHeader
        icon={Ship}
        title="Pre-SIRE 2.0 Inspection"
        description="OCIMF Ship Inspection Report Programme v2.0 - Vessel Risk Assessment"
        gradient="purple"
        badges={[
          { icon: ClipboardCheck, label: 'SIRE 2.0' },
          { icon: FileCheck, label: 'OCIMF' },
          { icon: Brain, label: 'AI Analysis' },
        ]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="inspections">Inspections</TabsTrigger>
          <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{overallScore}%</div>
                <Progress value={overallScore} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Questions Answered</CardTitle>
                <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {sireCategories.reduce((acc, cat) => acc + cat.completed, 0)} / {sireCategories.reduce((acc, cat) => acc + cat.questions, 0)}
                </div>
                <p className="text-xs text-muted-foreground">+12 this week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">23</div>
                <p className="text-xs text-muted-foreground">8 high priority</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inspections Done</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">47</div>
                <p className="text-xs text-muted-foreground">Last 12 months</p>
              </CardContent>
            </Card>
          </div>

          {/* Category Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                SIRE 2.0 Category Scores
              </CardTitle>
              <CardDescription>Performance across all SIRE 2.0 inspection categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sireCategories.map((category) => (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{category.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {category.completed}/{category.questions}
                        </span>
                        <Badge variant={category.score >= 90 ? 'default' : category.score >= 80 ? 'secondary' : 'destructive'}>
                          {category.score}%
                        </Badge>
                      </div>
                    </div>
                    <Progress value={category.score} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {sireCategories.map((category) => (
              <Card key={category.id} className="cursor-pointer hover:border-primary transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <CardDescription>{category.questions} questions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold">{category.score}%</span>
                    <Badge variant={category.score >= 90 ? 'default' : 'secondary'}>
                      {category.completed}/{category.questions}
                    </Badge>
                  </div>
                  <Progress value={category.score} className="h-2" />
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="inspections" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Inspections</CardTitle>
                <CardDescription>SIRE 2.0 inspections completed by fleet</CardDescription>
              </div>
              <Button>
                <FileCheck className="h-4 w-4 mr-2" />
                New Inspection
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentInspections.map((inspection, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Ship className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{inspection.vessel}</p>
                        <p className="text-sm text-muted-foreground">{inspection.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={inspection.score >= 90 ? 'default' : 'secondary'}>
                        Score: {inspection.score}%
                      </Badge>
                      <Badge variant={inspection.status === 'approved' ? 'default' : 'outline'}>
                        {inspection.status}
                      </Badge>
                      <Button variant="ghost" size="sm">View Report</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI-Powered SIRE 2.0 Analysis
              </CardTitle>
              <CardDescription>Machine learning insights for inspection optimization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium flex items-center gap-2 text-blue-900 dark:text-blue-100">
                  <Shield className="h-4 w-4" />
                  Key Recommendations
                </h4>
                <ul className="mt-2 space-y-2 text-sm text-blue-800 dark:text-blue-200">
                  <li>• Focus on Structural Condition category - lowest score at 85%</li>
                  <li>• 23 pending corrective actions require attention before next inspection</li>
                  <li>• Recommend refresher training for Navigation procedures</li>
                  <li>• Engine room maintenance records need updating</li>
                </ul>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium">Risk Prediction</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Based on current scores, fleet has 92% probability of passing next SIRE inspection
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium">Trend Analysis</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Overall compliance improved by 3.2% compared to previous quarter
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ModulePageWrapper>
  );
};

export default PreSIREInspection;
