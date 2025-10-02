import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  BookOpen,
  Clock,
  TrendingUp,
  BarChart3,
  Eye,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import type { LogEntry, DPMode } from '@/types/dp-modules';

export const DPLogbook: React.FC = () => {
  const { toast } = useToast();

  const mockEntries: LogEntry[] = [
    {
      id: 'log1',
      timestamp: new Date('2024-01-15T08:00:00'),
      type: 'mode_change',
      operatorId: 'op1',
      content: 'Changed from DP Manual to DP Auto for ROV operations',
      signed: true,
      signature: 'Carlos Silva'
    },
    {
      id: 'log2',
      timestamp: new Date('2024-01-15T12:00:00'),
      type: 'handover',
      operatorId: 'op2',
      content: 'Watch handover completed, all systems normal',
      signed: true,
      signature: 'João Santos'
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Smart DP Logbook</h1>
        <p className="text-muted-foreground">
          Digital logbook with automated entries and IMCA M117 compliance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: BookOpen, label: 'Entries Today', value: '24', color: 'text-blue-600' },
          { icon: CheckCircle, label: 'Compliance', value: '98%', color: 'text-green-600' },
          { icon: Clock, label: 'DP Hours', value: '156', color: 'text-purple-600' },
          { icon: AlertCircle, label: 'Incidents', value: '2', color: 'text-orange-600' }
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

      <Tabs defaultValue="entries" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="entries">
            <BookOpen className="h-4 w-4 mr-2" />
            Log Entries
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="compliance">
            <CheckCircle className="h-4 w-4 mr-2" />
            M117 Compliance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="entries">
          <Card>
            <CardHeader>
              <CardTitle>Digital Log Entries</CardTitle>
              <CardDescription>
                Automatically generated and manual entries with digital signatures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockEntries.map(entry => (
                  <Card key={entry.id}>
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{entry.type.replace(/_/g, ' ')}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {entry.timestamp.toLocaleString()}
                              </span>
                            </div>
                            <p className="mt-2">{entry.content}</p>
                          </div>
                          {entry.signed && (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-sm">Signed</span>
                            </div>
                          )}
                        </div>
                        {entry.signature && (
                          <p className="text-sm text-muted-foreground">
                            Signed by: {entry.signature}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Log Analytics</CardTitle>
              <CardDescription>
                Advanced filtering and trend analysis of logbook data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Most Active Shift', value: '08:00 - 12:00' },
                    { label: 'Average Entries/Day', value: '18' },
                    { label: 'Mode Changes', value: '45' },
                    { label: 'Watch Handovers', value: '120' }
                  ].map((metric, idx) => (
                    <Card key={idx}>
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">{metric.label}</p>
                        <p className="text-xl font-bold">{metric.value}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>IMCA M117 Compliance</CardTitle>
              <CardDescription>
                Automated validation of logbook compliance with IMCA standards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-900">
                        Logbook is 98% compliant with IMCA M117
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        All required entries are present and properly signed
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Required Entries', value: '100%', status: 'success' },
                    { label: 'Signature Rate', value: '98%', status: 'success' },
                    { label: 'Entry Frequency', value: '95%', status: 'success' },
                    { label: 'Quality Score', value: '92%', status: 'success' }
                  ].map((item, idx) => (
                    <Card key={idx}>
                      <CardContent className="pt-4 text-center">
                        <p className="text-2xl font-bold">{item.value}</p>
                        <p className="text-sm text-muted-foreground">{item.label}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
