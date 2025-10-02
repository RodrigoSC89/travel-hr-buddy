import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Cloud,
  Wind,
  Waves,
  Eye,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Activity,
  CheckCircle,
  XCircle
} from 'lucide-react';
import type { 
  EnvironmentalConditions,
  OperationalWindow,
  WeatherAlert,
  OperabilityIndex
} from '@/types/dp-modules';

export const OperationalWindow: React.FC = () => {
  const { toast } = useToast();

  const currentConditions: EnvironmentalConditions = {
    windSpeed: 18,
    windDirection: 225,
    currentSpeed: 1.2,
    currentDirection: 90,
    waveHeight: 1.8,
    visibility: 8
  };

  const operabilityIndex: OperabilityIndex = {
    overall: 78,
    factors: {
      wind: 85,
      current: 90,
      wave: 75,
      visibility: 95
    },
    status: 'good',
    limitations: ['ROV operations may be affected by wave height']
  };

  const weatherAlerts: WeatherAlert[] = [
    {
      id: 'wa1',
      type: 'gale',
      severity: 'medium',
      validFrom: new Date(Date.now() + 12 * 60 * 60 * 1000),
      validTo: new Date(Date.now() + 24 * 60 * 60 * 1000),
      description: 'Gale force winds expected within 12 hours',
      affectedOperations: ['Heavy lift', 'ROV operations']
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Intelligent Operational Window</h1>
        <p className="text-muted-foreground">
          Real-time weather integration and ASAOG limit validation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: Wind, label: 'Wind Speed', value: `${currentConditions.windSpeed} kts`, color: 'text-blue-600' },
          { icon: Waves, label: 'Wave Height', value: `${currentConditions.waveHeight} m`, color: 'text-cyan-600' },
          { icon: Activity, label: 'Current', value: `${currentConditions.currentSpeed} kts`, color: 'text-teal-600' },
          { icon: Eye, label: 'Visibility', value: `${currentConditions.visibility} nm`, color: 'text-green-600' }
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

      <Card>
        <CardHeader>
          <CardTitle>Operability Index</CardTitle>
          <CardDescription>
            Real-time calculation of operation feasibility
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-bold">{operabilityIndex.overall}%</p>
                <Badge variant={
                  operabilityIndex.status === 'excellent' ? 'default' :
                  operabilityIndex.status === 'good' ? 'secondary' :
                  'outline'
                } className="mt-2">
                  {operabilityIndex.status.toUpperCase()}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(operabilityIndex.factors).map(([factor, value]) => (
                  <div key={factor} className="text-center">
                    <p className="text-sm text-muted-foreground capitalize">{factor}</p>
                    <p className="text-lg font-bold">{value}%</p>
                  </div>
                ))}
              </div>
            </div>
            {operabilityIndex.limitations.length > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="font-medium text-yellow-900 mb-1">Limitations:</p>
                <ul className="text-sm text-yellow-700 list-disc list-inside">
                  {operabilityIndex.limitations.map((limitation, idx) => (
                    <li key={idx}>{limitation}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="current" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="current">
            <Cloud className="h-4 w-4 mr-2" />
            Current
          </TabsTrigger>
          <TabsTrigger value="forecast">
            <Calendar className="h-4 w-4 mr-2" />
            Forecast
          </TabsTrigger>
          <TabsTrigger value="asaog">
            <CheckCircle className="h-4 w-4 mr-2" />
            ASAOG Limits
          </TabsTrigger>
          <TabsTrigger value="optimization">
            <TrendingUp className="h-4 w-4 mr-2" />
            Optimization
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          <Card>
            <CardHeader>
              <CardTitle>Current Conditions</CardTitle>
              <CardDescription>Real-time weather and sea state data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Wind Speed', value: `${currentConditions.windSpeed} kts` },
                    { label: 'Wind Direction', value: `${currentConditions.windDirection}°` },
                    { label: 'Current Speed', value: `${currentConditions.currentSpeed} kts` },
                    { label: 'Current Direction', value: `${currentConditions.currentDirection}°` },
                    { label: 'Wave Height', value: `${currentConditions.waveHeight} m` },
                    { label: 'Visibility', value: `${currentConditions.visibility} nm` }
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="text-xl font-bold">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast">
          <Card>
            <CardHeader>
              <CardTitle>Weather Forecast</CardTitle>
              <CardDescription>48-hour forecast and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weatherAlerts.map(alert => (
                  <Card key={alert.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                          alert.severity === 'critical' ? 'text-red-600' :
                          alert.severity === 'high' ? 'text-orange-600' :
                          'text-yellow-600'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium capitalize">{alert.type} Warning</p>
                            <Badge variant={
                              alert.severity === 'critical' ? 'destructive' :
                              alert.severity === 'high' ? 'secondary' :
                              'outline'
                            }>
                              {alert.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                          <p className="text-xs text-muted-foreground">
                            Valid: {alert.validFrom.toLocaleString()} - {alert.validTo.toLocaleString()}
                          </p>
                          <div className="mt-2">
                            <p className="text-sm font-medium">Affected Operations:</p>
                            <div className="flex gap-2 mt-1">
                              {alert.affectedOperations.map((op, idx) => (
                                <Badge key={idx} variant="outline">{op}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="asaog">
          <Card>
            <CardHeader>
              <CardTitle>ASAOG Limit Validation</CardTitle>
              <CardDescription>Automatic validation against activity-specific operational limits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { operation: 'ROV Operations', limit: 20, current: 18, status: 'ok' },
                  { operation: 'Heavy Lift', limit: 15, current: 18, status: 'exceeded' },
                  { operation: 'Personnel Transfer', limit: 25, current: 18, status: 'ok' },
                  { operation: 'Diving Operations', limit: 12, current: 18, status: 'exceeded' }
                ].map((item, idx) => (
                  <Card key={idx}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{item.operation}</p>
                          <p className="text-sm text-muted-foreground">
                            Limit: {item.limit} kts | Current: {item.current} kts
                          </p>
                        </div>
                        {item.status === 'ok' ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-medium">OK</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-600">
                            <XCircle className="h-5 w-5" />
                            <span className="font-medium">Exceeded</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization">
          <Card>
            <CardHeader>
              <CardTitle>Operation Optimization</CardTitle>
              <CardDescription>AI-powered scheduling recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-900">
                        Optimal weather window identified
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        Best conditions for heavy lift operations: Tomorrow 06:00 - 14:00
                      </p>
                      <div className="mt-3 space-y-1 text-sm">
                        <p>• Expected wind: 10-12 kts</p>
                        <p>• Wave height: 0.8-1.2 m</p>
                        <p>• Visibility: Excellent (15+ nm)</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Card>
                  <CardContent className="pt-4">
                    <h4 className="font-medium mb-2">Risk Assessment</h4>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: 'Overall Risk', value: 'Low', color: 'text-green-600' },
                        { label: 'Weather Risk', value: 'Medium', color: 'text-yellow-600' },
                        { label: 'Operational Risk', value: 'Low', color: 'text-green-600' }
                      ].map((risk, idx) => (
                        <div key={idx} className="text-center">
                          <p className="text-sm text-muted-foreground">{risk.label}</p>
                          <p className={`text-lg font-bold ${risk.color}`}>{risk.value}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
