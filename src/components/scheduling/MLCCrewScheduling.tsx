import * as React from 'react';
const { useState } = React;
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, AlertTriangle, CheckCircle, Users, Ship, FileText, Shield } from 'lucide-react';

interface CrewSchedule {
  id: string;
  crewMemberId: string;
  crewMemberName: string;
  rank: string;
  vesselName: string;
  embarkDate: string;
  disembarkDate: string;
  contractDays: number;
  daysOnboard: number;
  maxDaysAllowed: number;
  restHoursCompliance: number;
  mlcStatus: 'compliant' | 'warning' | 'violation';
  nextLeaveDate: string;
}

interface RestHourRecord {
  date: string;
  workHours: number;
  restHours: number;
  compliant: boolean;
}

const mockSchedules: CrewSchedule[] = [
  {
    id: '1',
    crewMemberId: 'crew-001',
    crewMemberName: 'Carlos Silva',
    rank: 'Master',
    vesselName: 'MV Atlantic Explorer',
    embarkDate: '2024-01-15',
    disembarkDate: '2024-04-15',
    contractDays: 90,
    daysOnboard: 45,
    maxDaysAllowed: 90,
    restHoursCompliance: 98,
    mlcStatus: 'compliant',
    nextLeaveDate: '2024-04-16'
  },
  {
    id: '2',
    crewMemberId: 'crew-002',
    crewMemberName: 'João Santos',
    rank: 'Chief Officer',
    vesselName: 'MV Pacific Star',
    embarkDate: '2023-12-01',
    disembarkDate: '2024-03-01',
    contractDays: 90,
    daysOnboard: 85,
    maxDaysAllowed: 90,
    restHoursCompliance: 92,
    mlcStatus: 'warning',
    nextLeaveDate: '2024-03-02'
  },
  {
    id: '3',
    crewMemberId: 'crew-003',
    crewMemberName: 'Pedro Oliveira',
    rank: 'Second Engineer',
    vesselName: 'MV Indian Ocean',
    embarkDate: '2023-11-15',
    disembarkDate: '2024-02-15',
    contractDays: 90,
    daysOnboard: 92,
    maxDaysAllowed: 90,
    restHoursCompliance: 85,
    mlcStatus: 'violation',
    nextLeaveDate: 'OVERDUE'
  }
];

const mockRestHours: RestHourRecord[] = [
  { date: '2024-01-20', workHours: 10, restHours: 14, compliant: true },
  { date: '2024-01-21', workHours: 12, restHours: 12, compliant: true },
  { date: '2024-01-22', workHours: 8, restHours: 16, compliant: true },
  { date: '2024-01-23', workHours: 14, restHours: 10, compliant: false },
  { date: '2024-01-24', workHours: 10, restHours: 14, compliant: true }
];

export const MLCCrewScheduling: React.FC = () => {
  const [selectedCrew, setSelectedCrew] = useState<CrewSchedule | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'warning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'violation': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const complianceStats = {
    total: mockSchedules.length,
    compliant: mockSchedules.filter(s => s.mlcStatus === 'compliant').length,
    warnings: mockSchedules.filter(s => s.mlcStatus === 'warning').length,
    violations: mockSchedules.filter(s => s.mlcStatus === 'violation').length
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Crew</p>
                <p className="text-2xl font-bold">{complianceStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">MLC Compliant</p>
                <p className="text-2xl font-bold text-green-400">{complianceStats.compliant}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Warnings</p>
                <p className="text-2xl font-bold text-yellow-400">{complianceStats.warnings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Violations</p>
                <p className="text-2xl font-bold text-red-400">{complianceStats.violations}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="schedules" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="schedules">Crew Schedules</TabsTrigger>
          <TabsTrigger value="rest-hours">Rest Hours</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="schedules" className="space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                MLC 2006 Crew Rotation Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockSchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="p-4 rounded-lg border border-border/50 bg-background/50 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedCrew(schedule)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-sm font-bold">{schedule.crewMemberName.split(' ').map(n => n[0]).join('')}</span>
                        </div>
                        <div>
                          <p className="font-medium">{schedule.crewMemberName}</p>
                          <p className="text-sm text-muted-foreground">{schedule.rank} • {schedule.vesselName}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(schedule.mlcStatus)}>
                        {schedule.mlcStatus.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Days Onboard</p>
                        <p className="font-medium">{schedule.daysOnboard} / {schedule.maxDaysAllowed}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Contract Period</p>
                        <p className="font-medium">{schedule.embarkDate} - {schedule.disembarkDate}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Rest Compliance</p>
                        <p className="font-medium">{schedule.restHoursCompliance}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Next Leave</p>
                        <p className={`font-medium ${schedule.nextLeaveDate === 'OVERDUE' ? 'text-red-400' : ''}`}>
                          {schedule.nextLeaveDate}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Contract Progress</span>
                        <span>{Math.round((schedule.daysOnboard / schedule.contractDays) * 100)}%</span>
                      </div>
                      <Progress 
                        value={(schedule.daysOnboard / schedule.contractDays) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rest-hours" className="space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Rest Hours Monitoring (MLC Reg. 2.3)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockRestHours.map((record, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium">{record.date}</span>
                      <div className="flex gap-4 text-sm">
                        <span>Work: <strong>{record.workHours}h</strong></span>
                        <span>Rest: <strong>{record.restHours}h</strong></span>
                      </div>
                    </div>
                    <Badge className={record.compliant ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                      {record.compliant ? 'Compliant' : 'Non-Compliant'}
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <h4 className="font-medium text-blue-400 mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  MLC 2006 Requirements
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Minimum 10 hours rest in any 24-hour period</li>
                  <li>• Minimum 77 hours rest in any 7-day period</li>
                  <li>• Rest divided into no more than 2 periods (one ≥6h)</li>
                  <li>• Maximum 14 hours work in any 24-hour period</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Compliance Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto py-4 flex flex-col items-start gap-2">
                  <span className="font-medium">Generate MLC Compliance Report</span>
                  <span className="text-xs text-muted-foreground">Full crew compliance status for PSC inspection</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col items-start gap-2">
                  <span className="font-medium">Export Rest Hours Records</span>
                  <span className="text-xs text-muted-foreground">Last 30 days rest/work hours log</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col items-start gap-2">
                  <span className="font-medium">Crew Rotation Forecast</span>
                  <span className="text-xs text-muted-foreground">Upcoming reliefs and leave schedules</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col items-start gap-2">
                  <span className="font-medium">Violation History</span>
                  <span className="text-xs text-muted-foreground">Historical non-conformities and resolutions</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MLCCrewScheduling;
