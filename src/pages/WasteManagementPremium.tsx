/**
 * WasteManagementPremium - MARPOL Annex V Complete Compliance
 * TIER-1 Implementation based on Dockflow, Position Green, DNV Navigator
 */

import React, { Suspense, lazy, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Recycle, Droplets, Trash2, FileText, BarChart3, Settings,
  AlertTriangle, Ship, MapPin, Fuel, BookOpen, Award, GraduationCap,
  Globe, Flame, Package
} from "lucide-react";

// Tier-1 Components
const WasteManagementMARPOLPro = lazy(() => import("@/components/tier1/waste/WasteManagementMARPOLPro"));
const ElectronicGarbageRecordBook = lazy(() => import("@/components/tier1/waste/ElectronicGarbageRecordBook"));

// Legacy components - using named imports
const WasteCommandCenter = lazy(() => import("@/modules/waste-management/components/WasteCommandCenter"));
const GarbageRecordBookComplete = lazy(() => 
  import("@/modules/waste-management/components/GarbageRecordBookComplete").then(m => ({ default: m.GarbageRecordBookComplete }))
);
const OilRecordBookComplete = lazy(() => 
  import("@/modules/waste-management/components/OilRecordBookComplete").then(m => ({ default: m.OilRecordBookComplete }))
);
const TanksManagement = lazy(() => 
  import("@/modules/waste-management/components/TanksManagement").then(m => ({ default: m.TanksManagement }))
);
const EnvironmentalDashboard = lazy(() => import("@/modules/waste-management/components/EnvironmentalDashboard"));

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-[500px]" />
    </div>
  );
}

export default function WasteManagementPremium() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("wtab") || "command";

  const handleTabChange = (value: string) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set("wtab", value);
      return newParams;
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-teal-500/20 to-green-500/20 rounded-xl">
            <Recycle className="h-8 w-8 text-teal-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              Waste Management
              <Badge className="bg-teal-500">MARPOL Annex V</Badge>
            </h1>
            <p className="text-muted-foreground mt-1">
              Complete environmental compliance with electronic record books
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-success/10 text-success">
            <Award className="h-3 w-3 mr-1" />
            100% Compliant
          </Badge>
          <Badge variant="outline">TIER-1</Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 h-auto p-1">
          <TabsTrigger value="command" className="flex flex-col items-center gap-1 py-2">
            <Recycle className="h-4 w-4" />
            <span className="text-xs">Command</span>
          </TabsTrigger>
          <TabsTrigger value="tanks" className="flex flex-col items-center gap-1 py-2">
            <Droplets className="h-4 w-4" />
            <span className="text-xs">Tanks</span>
          </TabsTrigger>
          <TabsTrigger value="grb" className="flex flex-col items-center gap-1 py-2">
            <Trash2 className="h-4 w-4" />
            <span className="text-xs">e-GRB</span>
          </TabsTrigger>
          <TabsTrigger value="orb" className="flex flex-col items-center gap-1 py-2">
            <Fuel className="h-4 w-4" />
            <span className="text-xs">e-ORB</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex flex-col items-center gap-1 py-2">
            <Package className="h-4 w-4" />
            <span className="text-xs">Categories</span>
          </TabsTrigger>
          <TabsTrigger value="incinerator" className="flex flex-col items-center gap-1 py-2">
            <Flame className="h-4 w-4" />
            <span className="text-xs">Incinerator</span>
          </TabsTrigger>
          <TabsTrigger value="special-areas" className="flex flex-col items-center gap-1 py-2">
            <Globe className="h-4 w-4" />
            <span className="text-xs">Special Areas</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex flex-col items-center gap-1 py-2">
            <BarChart3 className="h-4 w-4" />
            <span className="text-xs">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="training" className="flex flex-col items-center gap-1 py-2">
            <GraduationCap className="h-4 w-4" />
            <span className="text-xs">Training</span>
          </TabsTrigger>
          <TabsTrigger value="plan" className="flex flex-col items-center gap-1 py-2">
            <BookOpen className="h-4 w-4" />
            <span className="text-xs">GMP</span>
          </TabsTrigger>
        </TabsList>

        {/* Tier-1 Command Center */}
        <TabsContent value="command">
          <Suspense fallback={<LoadingSkeleton />}>
            <WasteManagementMARPOLPro />
          </Suspense>
        </TabsContent>

        {/* Tanks Management */}
        <TabsContent value="tanks">
          <Suspense fallback={<LoadingSkeleton />}>
            <TanksManagement />
          </Suspense>
        </TabsContent>

        {/* e-GRB */}
        <TabsContent value="grb">
          <Suspense fallback={<LoadingSkeleton />}>
            <GarbageRecordBookComplete />
          </Suspense>
        </TabsContent>

        {/* e-ORB */}
        <TabsContent value="orb">
          <Suspense fallback={<LoadingSkeleton />}>
            <OilRecordBookComplete />
          </Suspense>
        </TabsContent>

        {/* MARPOL Categories */}
        <TabsContent value="categories">
          <MARPOLCategoriesPanel />
        </TabsContent>

        {/* Incinerator Logs */}
        <TabsContent value="incinerator">
          <IncineratorPanel />
        </TabsContent>

        {/* Special Areas */}
        <TabsContent value="special-areas">
          <SpecialAreasPanel />
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics">
          <Suspense fallback={<LoadingSkeleton />}>
            <EnvironmentalDashboard />
          </Suspense>
        </TabsContent>

        {/* Training */}
        <TabsContent value="training">
          <TrainingPanel />
        </TabsContent>

        {/* Garbage Management Plan */}
        <TabsContent value="plan">
          <GarbageManagementPlanPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// MARPOL Categories Panel
function MARPOLCategoriesPanel() {
  const categories = [
    { code: "A", name: "Plastics", color: "destructive", overboard: "PROHIBITED", icon: "🚫", restrictions: ["All plastics including synthetic ropes", "Fishing nets", "Plastic packaging"] },
    { code: "B", name: "Food Waste", color: "success", overboard: ">12nm (comminuted)", icon: "🍽️", restrictions: ["Must be ground to <25mm", "En route and >3nm from land", "Prohibited in Special Areas"] },
    { code: "C", name: "Domestic Waste", color: "warning", overboard: ">12nm", icon: "🗑️", restrictions: ["Paper, rags, glass, metal", "Bottles, crockery", "Outside Special Areas only"] },
    { code: "D", name: "Cooking Oil", color: "orange", overboard: ">12nm", icon: "🛢️", restrictions: ["Must not be mixed with cargo residues", "Outside Special Areas only"] },
    { code: "E", name: "Incinerator Ashes", color: "secondary", overboard: ">12nm", icon: "🔥", restrictions: ["From shipboard incinerator", "Not plastic-derived", "Outside Special Areas"] },
    { code: "F", name: "Operational Waste", color: "primary", overboard: "Conditional", icon: "⚙️", restrictions: ["Depends on type", "Cleaning agents - prohibited", "Maintenance products - restricted"] },
    { code: "G", name: "Animal Carcasses", color: "muted", overboard: "Max distance", icon: "🦴", restrictions: ["As far from land as possible", "Must be split or treated", "Outside Special Areas"] },
    { code: "H", name: "Fishing Gear", color: "blue", overboard: "PROHIBITED", icon: "🎣", restrictions: ["Except accidental loss", "Reasonable precautions required", "Must report if lost"] },
    { code: "I", name: "E-Waste", color: "purple", overboard: "PROHIBITED", icon: "💻", restrictions: ["Electronic equipment", "Batteries", "Port reception only"] },
    { code: "J", name: "Cargo Residues (HME)", color: "destructive", overboard: "PROHIBITED", icon: "☢️", restrictions: ["Harmful to Marine Environment", "Special handling required", "Documented procedures"] },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          MARPOL Annex V Garbage Categories
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.map(cat => (
            <Card key={cat.code} className={`border-l-4 border-l-${cat.color} hover:shadow-lg transition-shadow`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-2xl">{cat.icon}</div>
                  <div>
                    <Badge variant="outline" className="font-mono">Cat. {cat.code}</Badge>
                    <h4 className="font-medium mt-1">{cat.name}</h4>
                  </div>
                </div>
                <div className="mb-3">
                  <Badge variant={cat.overboard === 'PROHIBITED' ? 'destructive' : 'default'} className="text-xs">
                    {cat.overboard === 'PROHIBITED' ? '🚫 Prohibited at sea' : `✓ ${cat.overboard}`}
                  </Badge>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {cat.restrictions.map((r, i) => (
                    <li key={i}>• {r}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Incinerator Panel
function IncineratorPanel() {
  const logs = [
    { date: "2026-02-04", start: "08:00", end: "10:30", wasteType: "Plastics", quantity: 45, temp: 850, ashes: 3.2, operator: "C/E L. Eriksen" },
    { date: "2026-02-02", start: "14:00", end: "15:45", wasteType: "Food Waste", quantity: 32, temp: 620, ashes: 1.8, operator: "2/E P. Santos" },
    { date: "2026-01-30", start: "09:00", end: "11:00", wasteType: "Mixed (no plastics)", quantity: 38, temp: 680, ashes: 2.5, operator: "C/E L. Eriksen" },
  ];

  return (
    <div className="space-y-6">
      {/* Incinerator Status */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="text-xl font-bold text-success">Operational</p>
              </div>
              <Flame className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Model</p>
            <p className="font-medium">TeamTec GS-500</p>
            <p className="text-xs text-muted-foreground">IMO Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Capacity</p>
            <p className="font-medium">50 kg/batch</p>
            <p className="text-xs text-muted-foreground">25 kg/h continuous</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Next Service</p>
            <p className="font-medium">2026-04-15</p>
            <p className="text-xs text-warning">69 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Incinerator Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {logs.map((log, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="font-medium">{log.wasteType}</p>
                    <p className="text-xs text-muted-foreground">{log.date} • {log.start} - {log.end}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Quantity</p>
                    <p className="font-medium">{log.quantity} kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Temp</p>
                    <p className="font-medium">{log.temp}°C</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Ashes</p>
                    <p className="font-medium">{log.ashes} kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Operator</p>
                    <p className="font-medium">{log.operator}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Special Areas Panel
function SpecialAreasPanel() {
  const areas = [
    { name: "Mediterranean Sea", status: "active", plastics: "PROHIBITED", food: "PROHIBITED", other: "Restricted" },
    { name: "Baltic Sea", status: "active", plastics: "PROHIBITED", food: ">12nm comminuted", other: "PROHIBITED" },
    { name: "Black Sea", status: "active", plastics: "PROHIBITED", food: "PROHIBITED", other: "PROHIBITED" },
    { name: "Red Sea", status: "active", plastics: "PROHIBITED", food: "PROHIBITED", other: "Restricted" },
    { name: "North Sea", status: "active", plastics: "PROHIBITED", food: ">12nm comminuted", other: "Restricted" },
    { name: "Antarctic Area", status: "active", plastics: "PROHIBITED", food: ">12nm only", other: "PROHIBITED" },
    { name: "Wider Caribbean", status: "active", plastics: "PROHIBITED", food: ">12nm comminuted", other: "Restricted" },
    { name: "Gulf Area (Arabian)", status: "active", plastics: "PROHIBITED", food: "PROHIBITED", other: "PROHIBITED" },
  ];

  return (
    <div className="space-y-6">
      {/* Current Position Alert */}
      <Card className="bg-gradient-to-r from-primary/10 to-transparent border-primary/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="h-6 w-6 text-primary" />
              <div>
                <p className="font-medium">Current Position: Atlantic Ocean</p>
                <p className="text-sm text-muted-foreground">Not in Special Area - Standard MARPOL Annex V applies</p>
              </div>
            </div>
            <Badge className="bg-success">Normal Operations</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Special Areas Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            MARPOL Special Areas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {areas.map(area => (
              <Card key={area.name} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3">{area.name}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Plastics:</span>
                      <Badge variant="destructive" className="text-xs">{area.plastics}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Food:</span>
                      <Badge variant={area.food === 'PROHIBITED' ? 'destructive' : 'secondary'} className="text-xs">
                        {area.food}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Other:</span>
                      <Badge variant={area.other === 'PROHIBITED' ? 'destructive' : 'outline'} className="text-xs">
                        {area.other}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Training Panel
function TrainingPanel() {
  const courses = [
    { title: "MARPOL Annex V Basics", duration: "2h", completion: 100, mandatory: true },
    { title: "Waste Segregation Procedures", duration: "1.5h", completion: 100, mandatory: true },
    { title: "Garbage Record Book Entry", duration: "1h", completion: 85, mandatory: true },
    { title: "Incinerator Operation", duration: "3h", completion: 60, mandatory: false },
    { title: "Port Reception Procedures", duration: "1h", completion: 0, mandatory: false },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-success/10 to-transparent border-success/30">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Crew Trained</p>
            <p className="text-2xl font-bold text-success">24/25</p>
            <p className="text-xs text-success">96% completion</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Certificates Valid</p>
            <p className="text-2xl font-bold">22</p>
            <p className="text-xs text-warning">3 expiring soon</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Next Refresh</p>
            <p className="text-2xl font-bold">15 Mar</p>
            <p className="text-xs text-muted-foreground">Annual refresher</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Training Modules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {courses.map((course, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{course.title}</p>
                    <p className="text-xs text-muted-foreground">Duration: {course.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {course.mandatory && <Badge variant="outline">Mandatory</Badge>}
                  <div className="w-24">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${course.completion === 100 ? 'bg-success' : 'bg-primary'}`}
                        style={{ width: `${course.completion}%` }}
                      />
                    </div>
                    <p className="text-xs text-center mt-1">{course.completion}%</p>
                  </div>
                  <Button variant="outline" size="sm">
                    {course.completion === 100 ? 'Review' : 'Continue'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Garbage Management Plan Panel
function GarbageManagementPlanPanel() {
  const sections = [
    { title: "Person in Charge", responsible: "Chief Officer M. Santos", status: "current" },
    { title: "Collection Procedures", responsible: "Bosun", status: "current" },
    { title: "Processing Equipment", responsible: "Chief Engineer", status: "review" },
    { title: "Discharge Procedures", responsible: "Chief Officer", status: "current" },
    { title: "GRB Procedures", responsible: "Master", status: "current" },
    { title: "Port Reception", responsible: "Agent Coordinator", status: "current" },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-primary/10 to-transparent border-primary/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-primary" />
              <div>
                <p className="font-medium">Garbage Management Plan</p>
                <p className="text-sm text-muted-foreground">IMO MEPC.277(70) Compliant</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-success">Approved</Badge>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-1" />
                View Full Plan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Plan Sections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sections.map((section, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50">
                  <div>
                    <p className="font-medium text-sm">{section.title}</p>
                    <p className="text-xs text-muted-foreground">{section.responsible}</p>
                  </div>
                  <Badge variant={section.status === 'current' ? 'default' : 'secondary'}>
                    {section.status === 'current' ? 'Current' : 'Needs Review'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Placards Displayed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { location: "Galley", language: "English/Filipino", checked: "2026-02-01" },
                { location: "Crew Mess", language: "English/Filipino", checked: "2026-02-01" },
                { location: "Officer Mess", language: "English", checked: "2026-02-01" },
                { location: "Main Deck Garbage", language: "English", checked: "2026-02-01" },
                { location: "Engine Room", language: "English", checked: "2026-02-01" },
              ].map((placard, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50">
                  <div>
                    <p className="font-medium text-sm">{placard.location}</p>
                    <p className="text-xs text-muted-foreground">{placard.language}</p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>Last checked</p>
                    <p>{placard.checked}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
