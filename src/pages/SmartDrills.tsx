// PATCH 599: Smart Drills Page
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Calendar, CheckCircle, Plus, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SmartDrillsService } from '@/services/smart-drills.service';
import type { SmartDrill, DrillStatistics } from '@/types/smart-drills';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

const SmartDrills: React.FC = () => {
  const [drills, setDrills] = useState<SmartDrill[]>([]);
  const [stats, setStats] = useState<DrillStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDrills();
    loadStats();
  }, []);

  const loadDrills = async () => {
    try {
      setLoading(true);
      const data = await SmartDrillsService.getDrills();
      setDrills(data);
    } catch (error) {
      logger.error('Error loading drills', { error });
      toast.error('Failed to load drills');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await SmartDrillsService.getDrillStatistics();
      setStats(data);
    } catch (error) {
      logger.error('Error loading stats', { error });
    }
  };

  const handleGenerateDrill = async () => {
    try {
      toast.info('Generating drill scenario with AI...');
      const scenario = await SmartDrillsService.generateDrillScenario({
        drill_type: 'fire',
        difficulty: 'intermediate',
      });

      const newDrill = await SmartDrillsService.createDrill({
        title: scenario.title,
        description: scenario.description,
        drill_type: 'fire',
        scenario: scenario.scenario,
        objectives: scenario.objectives,
        duration_minutes: scenario.duration_minutes,
        scheduled_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        ai_generated: true,
        status: 'scheduled',
      });

      toast.success('Drill created successfully');
      loadDrills();
      loadStats();
    } catch (error) {
      logger.error('Error generating drill', { error });
      toast.error('Failed to generate drill');
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-yellow-500';
    }
  };

  const getDrillTypeLabel = (type: string): string => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-8 w-8" />
            Smart Drills
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered emergency drill management
          </p>
        </div>
        <Button onClick={handleGenerateDrill}>
          <Plus className="h-4 w-4 mr-2" />
          Generate Drill
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Drills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_drills || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.completed_drills || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats?.scheduled_drills || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Avg. Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.average_score ? stats.average_score.toFixed(1) : '0'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Drills List */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Drills</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          {loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Loading drills...</p>
              </CardContent>
            </Card>
          ) : drills.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No drills found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {drills.map((drill) => (
                <Card key={drill.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {drill.title}
                          {drill.ai_generated && (
                            <Badge variant="outline" className="text-xs">AI Generated</Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {drill.description}
                        </CardDescription>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(drill.status)}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(drill.scheduled_date).toLocaleDateString()}
                        </div>
                        <Badge variant="secondary">{getDrillTypeLabel(drill.drill_type)}</Badge>
                        <span>{drill.duration_minutes} minutes</span>
                      </div>
                      {drill.status === 'completed' && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4 mt-4">
          <div className="grid gap-4">
            {drills.filter(d => d.status === 'scheduled').map((drill) => (
              <Card key={drill.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{drill.title}</CardTitle>
                  <CardDescription>{drill.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(drill.scheduled_date).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-4">
          <div className="grid gap-4">
            {drills.filter(d => d.status === 'completed').map((drill) => (
              <Card key={drill.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{drill.title}</CardTitle>
                  <CardDescription>{drill.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Completed: {drill.completed_at && new Date(drill.completed_at).toLocaleDateString()}
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SmartDrills;
