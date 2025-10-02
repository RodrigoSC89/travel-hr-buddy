import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  GraduationCap,
  TrendingUp,
  Award,
  Bell,
  Users,
  BookOpen,
  Target,
  Gamepad2,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import type {
  DPOperator,
  CPDRecord,
  SimulationSession,
  Certificate,
  Mentorship
} from '@/types/dp-modules';

export const DPTrainingCenter: React.FC = () => {
  const { toast } = useToast();
  const [selectedOperator, setSelectedOperator] = useState<DPOperator | null>(null);

  const mockOperator: DPOperator = {
    id: 'op1',
    name: 'Carlos Silva',
    email: 'carlos@vessel.com',
    certificateNumber: 'DP-12345',
    dpClass: 'Unlimited',
    experienceYears: 8,
    vesselTypes: ['FPSO', 'DSV', 'PSV'],
    currentVessel: 'Vessel Alpha'
  };

  const cpdRecords: CPDRecord[] = [
    {
      id: 'cpd1',
      operatorId: 'op1',
      date: new Date('2024-01-15'),
      hours: 8,
      activity: 'Advanced DP Simulation - Emergency Scenarios',
      category: 'simulation',
      approvedBy: 'Training Coordinator'
    },
    {
      id: 'cpd2',
      operatorId: 'op1',
      date: new Date('2024-02-10'),
      hours: 16,
      activity: 'IMCA M117 Refresher Course',
      category: 'course',
      approvedBy: 'Training Manager'
    }
  ];

  const expiringCerts: Certificate[] = [
    {
      id: 'cert1',
      operatorId: 'op1',
      type: 'STCW',
      name: 'STCW Advanced Training',
      number: 'STCW-2024-001',
      issueDate: new Date('2020-01-01'),
      expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      status: 'expiring_soon'
    }
  ];

  const runSimulation = () => {
    toast({
      title: 'Simulation Started',
      description: 'DP fault response scenario initiated',
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">DP Competence Hub</h1>
          <p className="text-muted-foreground">
            Digital Training Center with CPD tracking, simulations, and certifications
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: GraduationCap, label: 'Active DPOs', value: '45', color: 'text-blue-600' },
          { icon: TrendingUp, label: 'CPD Hours (YTD)', value: '1,234', color: 'text-green-600' },
          { icon: Award, label: 'Certifications', value: '89', color: 'text-purple-600' },
          { icon: Bell, label: 'Expiring Soon', value: '3', color: 'text-orange-600' }
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

      <Tabs defaultValue="cpd" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="cpd">
            <TrendingUp className="h-4 w-4 mr-2" />
            CPD Tracker
          </TabsTrigger>
          <TabsTrigger value="simulator">
            <Gamepad2 className="h-4 w-4 mr-2" />
            Simulator
          </TabsTrigger>
          <TabsTrigger value="assessments">
            <Target className="h-4 w-4 mr-2" />
            Assessments
          </TabsTrigger>
          <TabsTrigger value="certificates">
            <Award className="h-4 w-4 mr-2" />
            Certificates
          </TabsTrigger>
          <TabsTrigger value="mentoring">
            <Users className="h-4 w-4 mr-2" />
            Mentoring
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cpd">
          <Card>
            <CardHeader>
              <CardTitle>Continuous Professional Development (CPD) Tracker</CardTitle>
              <CardDescription>IMCA M117 compliant CPD hours tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-semibold">{mockOperator.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {mockOperator.dpClass} DP Operator • {mockOperator.experienceYears} years
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">24 hrs</p>
                    <p className="text-sm text-muted-foreground">This Year</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Recent Activities</h4>
                  {cpdRecords.map(record => (
                    <Card key={record.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{record.activity}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline">{record.category}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {record.date.toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <Badge variant="default">{record.hours}h</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="pt-4">
                  <h4 className="font-semibold mb-2">Annual Progress</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>24 of 60 hours required</span>
                      <span>40%</span>
                    </div>
                    <Progress value={40} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simulator">
          <Card>
            <CardHeader>
              <CardTitle>DP Simulation Engine</CardTitle>
              <CardDescription>Practice fault response and operations scenarios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'Thruster Failure', difficulty: 'Medium', duration: '30 min' },
                  { title: 'Generator Loss', difficulty: 'High', duration: '45 min' },
                  { title: 'Sensor Degradation', difficulty: 'Low', duration: '20 min' },
                  { title: 'WCF Scenario', difficulty: 'Expert', duration: '60 min' }
                ].map((scenario, idx) => (
                  <Card key={idx}>
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{scenario.title}</h4>
                          <Badge variant={
                            scenario.difficulty === 'Expert' ? 'destructive' :
                            scenario.difficulty === 'High' ? 'secondary' :
                            'outline'
                          }>
                            {scenario.difficulty}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {scenario.duration}
                        </div>
                        <Button className="w-full" onClick={runSimulation}>
                          <Gamepad2 className="mr-2 h-4 w-4" />
                          Start Simulation
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments">
          <Card>
            <CardHeader>
              <CardTitle>Assessment System</CardTitle>
              <CardDescription>Evaluate operator competency and knowledge</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: 'DP Systems Knowledge', score: 92, status: 'completed' },
                  { title: 'Emergency Response', score: 88, status: 'completed' },
                  { title: 'IMCA Regulations', score: null, status: 'pending' }
                ].map((assessment, idx) => (
                  <Card key={idx}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {assessment.status === 'completed' ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Clock className="h-5 w-5 text-orange-600" />
                          )}
                          <div>
                            <p className="font-medium">{assessment.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {assessment.status === 'completed' ? 'Completed' : 'Pending'}
                            </p>
                          </div>
                        </div>
                        {assessment.score && (
                          <div className="text-right">
                            <p className="text-2xl font-bold">{assessment.score}%</p>
                            <p className="text-sm text-green-600">Passed</p>
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

        <TabsContent value="certificates">
          <Card>
            <CardHeader>
              <CardTitle>Certificate Management</CardTitle>
              <CardDescription>Track STCW, IMCA, and company certifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-orange-900">
                        3 certificates expiring within 60 days
                      </p>
                      <p className="text-sm text-orange-700 mt-1">
                        Action required to maintain compliance
                      </p>
                    </div>
                  </div>
                </div>

                {expiringCerts.map(cert => (
                  <Card key={cert.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{cert.name}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Number: {cert.number}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">
                              Expires: {cert.expiryDate?.toLocaleDateString()}
                            </Badge>
                            <Badge variant="secondary">
                              {Math.floor((cert.expiryDate!.getTime() - Date.now()) / (24 * 60 * 60 * 1000))} days left
                            </Badge>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Renew
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mentoring">
          <Card>
            <CardHeader>
              <CardTitle>Digital Mentoring System</CardTitle>
              <CardDescription>Connect senior and junior DPOs for knowledge transfer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                      <p className="text-2xl font-bold">12</p>
                      <p className="text-sm text-muted-foreground">Active Mentorships</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <TrendingUp className="h-8 w-8 mx-auto text-green-600 mb-2" />
                      <p className="text-2xl font-bold">85%</p>
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Senior DPO Mentorship Program</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Match junior operators with experienced mentors
                        </p>
                      </div>
                      <Button>Find Mentor</Button>
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
