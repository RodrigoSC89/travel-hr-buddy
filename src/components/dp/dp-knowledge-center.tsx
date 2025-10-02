import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Database,
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Filter,
  Search
} from 'lucide-react';
import type { DPEvent, Pattern, Insight } from '@/types/dp-modules';

export const DPKnowledgeCenter: React.FC = () => {
  const { toast } = useToast();

  const mockEvents: DPEvent[] = [
    {
      id: 'evt1',
      date: new Date('2024-01-15'),
      vesselId: 'v1',
      vesselName: 'Vessel Alpha',
      operatorId: 'op1',
      operation: 'ROV Operations',
      conditions: {
        windSpeed: 25,
        windDirection: 180,
        currentSpeed: 1.5,
        currentDirection: 90,
        waveHeight: 2.5,
        visibility: 5
      },
      incident: {
        type: 'system_failure',
        severity: 'medium',
        description: 'Thruster #3 degradation during operations',
        injuries: false,
        damage: false,
        environmentalImpact: false
      }
    }
  ];

  const patterns: Pattern[] = [
    {
      id: 'p1',
      type: 'thruster_degradation',
      description: 'Increased thruster failures during heavy weather operations',
      frequency: 12,
      significance: 0.85,
      relatedEvents: ['evt1', 'evt2'],
      recommendations: [
        'Implement enhanced preventive maintenance schedule',
        'Review ASAOG limits for high wind conditions'
      ]
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">DP Knowledge Center</h1>
        <p className="text-muted-foreground">
          Lessons learned database with AI-powered event analysis and mitigation recommendations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: Database, label: 'Total Events', value: '234', color: 'text-blue-600' },
          { icon: Brain, label: 'Patterns Detected', value: '18', color: 'text-purple-600' },
          { icon: TrendingUp, label: 'Lessons Learned', value: '89', color: 'text-green-600' },
          { icon: AlertTriangle, label: 'Critical Issues', value: '5', color: 'text-red-600' }
        ].map((stat, idx) => (
          <Card key={idx}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="events">
            <Database className="h-4 w-4 mr-2" />
            Event Database
          </TabsTrigger>
          <TabsTrigger value="patterns">
            <Brain className="h-4 w-4 mr-2" />
            Pattern Recognition
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <TrendingUp className="h-4 w-4 mr-2" />
            Recommendations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>DP Event Database</CardTitle>
              <CardDescription>
                Comprehensive database of DP events, incidents, and near-misses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>

                {mockEvents.map(event => (
                  <Card key={event.id}>
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{event.vesselName}</p>
                            <p className="text-sm text-muted-foreground">{event.operation}</p>
                          </div>
                          <Badge variant={
                            event.incident?.severity === 'critical' ? 'destructive' :
                            event.incident?.severity === 'high' ? 'secondary' :
                            'outline'
                          }>
                            {event.incident?.severity}
                          </Badge>
                        </div>
                        <p className="text-sm">{event.incident?.description}</p>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span>{event.date.toLocaleDateString()}</span>
                          <span>•</span>
                          <span>Wind: {event.conditions.windSpeed}kts</span>
                          <span>•</span>
                          <span>Wave: {event.conditions.waveHeight}m</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns">
          <Card>
            <CardHeader>
              <CardTitle>AI Pattern Recognition</CardTitle>
              <CardDescription>
                Machine learning analysis identifying failure patterns and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patterns.map(pattern => (
                  <Card key={pattern.id}>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{pattern.description}</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">
                                {pattern.frequency} occurrences
                              </Badge>
                              <Badge variant="default">
                                {Math.round(pattern.significance * 100)}% significance
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-sm">
                          <p className="font-medium mb-1">Recommendations:</p>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            {pattern.recommendations.map((rec, idx) => (
                              <li key={idx}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>Intelligent Mitigation Recommendations</CardTitle>
              <CardDescription>
                AI-generated recommendations for DPOM, ASAOG, and CAMO updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    type: 'DPOM Update',
                    priority: 'high',
                    description: 'Update section 4.2 with enhanced thruster failure procedures'
                  },
                  {
                    type: 'ASAOG Revision',
                    priority: 'medium',
                    description: 'Revise wind speed limits for ROV operations based on recent data'
                  },
                  {
                    type: 'CAMO Enhancement',
                    priority: 'medium',
                    description: 'Increase thruster inspection frequency during heavy weather season'
                  }
                ].map((rec, idx) => (
                  <Card key={idx}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{rec.type}</p>
                            <Badge variant={
                              rec.priority === 'high' ? 'destructive' :
                              rec.priority === 'medium' ? 'secondary' :
                              'outline'
                            }>
                              {rec.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{rec.description}</p>
                        </div>
                        <Button variant="outline" size="sm">Apply</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
