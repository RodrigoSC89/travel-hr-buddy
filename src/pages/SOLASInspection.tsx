/**
 * SOLAS/LSA/FFE Inspection Page
 * Safety of Life at Sea + Life-Saving Appliances + Fire-Fighting Equipment
 */
import type { FC } from 'react';
import { useState } from 'react';
import { ModulePageWrapper } from '@/components/ui/module-page-wrapper';
import { ModuleHeader } from '@/components/ui/module-header';
import { Ship, FileCheck, Brain, AlertTriangle, CheckCircle2, Flame, LifeBuoy, ShieldCheck, Clock, Calendar, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const SOLASInspection: FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const solasCategories = [
    { id: 'lsa', name: 'Life-Saving Appliances', icon: LifeBuoy, items: 45, compliant: 43, expiring: 2 },
    { id: 'ffe', name: 'Fire-Fighting Equipment', icon: Flame, items: 67, compliant: 65, expiring: 4 },
    { id: 'nav', name: 'Navigation Equipment', icon: Ship, items: 32, compliant: 32, expiring: 0 },
    { id: 'radio', name: 'Radio Equipment (GMDSS)', icon: ShieldCheck, items: 18, compliant: 17, expiring: 1 },
  ];

  const upcomingDrills = [
    { type: 'Abandon Ship Drill', vessel: 'MV Atlantic Pioneer', date: '2026-02-10', status: 'scheduled' },
    { type: 'Fire Drill', vessel: 'MT Pacific Spirit', date: '2026-02-12', status: 'scheduled' },
    { type: 'Man Overboard Drill', vessel: 'MV Ocean Voyager', date: '2026-02-15', status: 'pending' },
  ];

  const totalItems = solasCategories.reduce((acc, cat) => acc + cat.items, 0);
  const totalCompliant = solasCategories.reduce((acc, cat) => acc + cat.compliant, 0);
  const totalExpiring = solasCategories.reduce((acc, cat) => acc + cat.expiring, 0);
  const complianceRate = Math.round((totalCompliant / totalItems) * 100);

  return (
    <ModulePageWrapper gradient="orange">
      <ModuleHeader
        icon={Ship}
        title="SOLAS/LSA/FFE Compliance"
        description="Safety of Life at Sea - Life-Saving Appliances & Fire-Fighting Equipment"
        gradient="red"
        badges={[
          { icon: LifeBuoy, label: 'LSA' },
          { icon: Flame, label: 'FFE' },
          { icon: Brain, label: 'AI Monitoring' },
        ]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="drills">Drills</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{complianceRate}%</div>
                <Progress value={complianceRate} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
                <Ship className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalItems}</div>
                <p className="text-xs text-muted-foreground">{totalCompliant} compliant</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{totalExpiring}</div>
                <p className="text-xs text-muted-foreground">Within 30 days</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Drills</CardTitle>
                <Calendar className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{upcomingDrills.length}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>

          {/* Category Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {solasCategories.map((category) => {
              const CategoryIcon = category.icon;
              const rate = Math.round((category.compliant / category.items) * 100);
              return (
                <Card key={category.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CategoryIcon className="h-5 w-5" />
                      {category.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Compliance</span>
                        <span className="font-medium">{rate}%</span>
                      </div>
                      <Progress value={rate} />
                      <div className="flex justify-between text-xs text-muted-foreground pt-2">
                        <span>{category.compliant}/{category.items} items</span>
                        {category.expiring > 0 && (
                          <Badge variant="outline" className="text-orange-600">
                            {category.expiring} expiring
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="equipment" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Equipment Inventory</CardTitle>
                <CardDescription>SOLAS-regulated safety equipment across fleet</CardDescription>
              </div>
              <Button>
                <FileCheck className="h-4 w-4 mr-2" />
                Add Equipment
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Ship className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a category above to view equipment details</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drills" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Safety Drills</CardTitle>
                <CardDescription>SOLAS-mandated drills and exercises</CardDescription>
              </div>
              <Button>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Drill
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingDrills.map((drill, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded ${drill.type.includes('Fire') ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                        {drill.type.includes('Fire') ? <Flame className="h-5 w-5" /> : <LifeBuoy className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-medium">{drill.type}</p>
                        <p className="text-sm text-muted-foreground">{drill.vessel}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{drill.date}</p>
                        <Badge variant={drill.status === 'scheduled' ? 'default' : 'outline'}>
                          {drill.status}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm">Details</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SOLAS Certificates</CardTitle>
              <CardDescription>Safety Equipment Certificates and Service Records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Certificate management for SOLAS equipment</p>
                <Button className="mt-4" variant="outline">View All Certificates</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ModulePageWrapper>
  );
};

export default SOLASInspection;
