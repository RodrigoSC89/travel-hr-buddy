/**
 * Laytime & Demurrage Module - TIER-1 BIMCO Compliant
 * Based on IMOS, Dataloy, Netpas Laytime
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock, Anchor, Ship, DollarSign, Calendar, AlertTriangle,
  CheckCircle, Timer, FileText, Calculator, TrendingUp, ArrowRight
} from "lucide-react";

interface LaytimeCalculation {
  id: string;
  voyage: string;
  port: string;
  operation: 'loading' | 'discharging';
  cargoType: string;
  quantity: number;
  unit: 'MT' | 'CBM';
  allowedRate: number;
  rateUnit: string;
  weatherWorkingDays: boolean;
  nor: {
    tendered: Date;
    accepted: Date;
    laytimeCommences: Date;
  };
  events: LaytimeEvent[];
  totalLaytime: number;
  timeUsed: number;
  demurrageRate: number;
  despatchRate: number;
  result: {
    type: 'demurrage' | 'despatch' | 'even';
    timeBalance: number;
    amount: number;
  };
}

interface LaytimeEvent {
  id: string;
  date: string;
  fromTime: string;
  toTime: string;
  hours: number;
  operation: string;
  percentage: number;
  laytimeUsed: number;
  remarks: string;
  excluded: boolean;
  excludeReason?: string;
}

// Fallback Statement of Facts
const fallbackSOF: LaytimeEvent[] = [
  { id: "1", date: "2026-02-01", fromTime: "06:00", toTime: "18:00", hours: 12, operation: "Loading", percentage: 100, laytimeUsed: 12, remarks: "Normal working", excluded: false },
  { id: "2", date: "2026-02-01", fromTime: "18:00", toTime: "24:00", hours: 6, operation: "Night work", percentage: 50, laytimeUsed: 3, remarks: "Reduced rate", excluded: false },
  { id: "3", date: "2026-02-02", fromTime: "00:00", toTime: "08:00", hours: 8, operation: "Rain stoppage", percentage: 0, laytimeUsed: 0, remarks: "Weather excluded", excluded: true, excludeReason: "Weather" },
  { id: "4", date: "2026-02-02", fromTime: "08:00", toTime: "18:00", hours: 10, operation: "Loading resumed", percentage: 100, laytimeUsed: 10, remarks: "Normal working", excluded: false },
  { id: "5", date: "2026-02-02", fromTime: "18:00", toTime: "24:00", hours: 6, operation: "Loading", percentage: 100, laytimeUsed: 6, remarks: "Overtime", excluded: false },
  { id: "6", date: "2026-02-03", fromTime: "06:00", toTime: "14:00", hours: 8, operation: "Completed", percentage: 100, laytimeUsed: 8, remarks: "Loading completed at 14:00", excluded: false },
];

// Laytime Calculator Component
function LaytimeCalculator() {
  const [formData, setFormData] = useState({
    cargoQuantity: 45000,
    allowedRate: 8000,
    rateUnit: "PWWD SHINC",
    demurrageRate: 25000,
    despatchRate: 12500,
    timeUsed: 39,
  });

  const allowedLaytime = formData.cargoQuantity / formData.allowedRate * 24; // in hours
  const timeBalance = allowedLaytime - formData.timeUsed;
  const isDemurrage = timeBalance < 0;
  const amount = Math.abs(timeBalance) * (isDemurrage ? formData.demurrageRate : formData.despatchRate) / 24;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          Laytime Calculator (BIMCO)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Cargo Quantity (MT)</Label>
            <Input
              type="number"
              value={formData.cargoQuantity}
              onChange={e => setFormData({ ...formData, cargoQuantity: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label className="text-xs">Loading Rate (MT/day)</Label>
            <Input
              type="number"
              value={formData.allowedRate}
              onChange={e => setFormData({ ...formData, allowedRate: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label className="text-xs">Demurrage Rate (USD/day)</Label>
            <Input
              type="number"
              value={formData.demurrageRate}
              onChange={e => setFormData({ ...formData, demurrageRate: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label className="text-xs">Time Used (hours)</Label>
            <Input
              type="number"
              value={formData.timeUsed}
              onChange={e => setFormData({ ...formData, timeUsed: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-primary/10 to-transparent rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Allowed Laytime</p>
              <p className="font-medium">{allowedLaytime.toFixed(1)} hours ({(allowedLaytime/24).toFixed(2)} days)</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Time Balance</p>
              <p className={`font-medium ${isDemurrage ? 'text-destructive' : 'text-success'}`}>
                {timeBalance > 0 ? '+' : ''}{timeBalance.toFixed(1)} hours
              </p>
            </div>
          </div>
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <Badge variant={isDemurrage ? 'destructive' : 'default'}>
                {isDemurrage ? 'DEMURRAGE' : 'DESPATCH'}
              </Badge>
              <p className="text-xl font-bold">
                ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>Rate: {formData.rateUnit} - Per Weather Working Day, Sundays/Holidays Included</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Statement of Facts Table
function StatementOfFacts({ events }: { events: LaytimeEvent[] }) {
  const totalLaytime = events.reduce((acc, e) => acc + e.laytimeUsed, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Statement of Facts
          </CardTitle>
          <Badge variant="outline">Total: {totalLaytime}h used</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Time</th>
                <th className="p-2 text-right">Hours</th>
                <th className="p-2 text-left">Operation</th>
                <th className="p-2 text-right">%</th>
                <th className="p-2 text-right">Laytime</th>
                <th className="p-2 text-left">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr key={event.id} className={`border-b ${event.excluded ? 'bg-muted/50' : ''}`}>
                  <td className="p-2">{event.date}</td>
                  <td className="p-2">{event.fromTime} - {event.toTime}</td>
                  <td className="p-2 text-right">{event.hours}h</td>
                  <td className="p-2">{event.operation}</td>
                  <td className="p-2 text-right">
                    <Badge variant={event.percentage === 100 ? 'default' : 'secondary'} className="text-xs">
                      {event.percentage}%
                    </Badge>
                  </td>
                  <td className="p-2 text-right font-medium">{event.laytimeUsed}h</td>
                  <td className="p-2">
                    <span className="text-muted-foreground">{event.remarks}</span>
                    {event.excluded && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Excluded: {event.excludeReason}
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-muted/50 font-medium">
                <td className="p-2" colSpan={5}>Total Laytime Used</td>
                <td className="p-2 text-right">{totalLaytime}h</td>
                <td className="p-2">{(totalLaytime/24).toFixed(2)} days</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// NOR Timeline Component
function NORTimeline() {
  const norEvents = [
    { label: "NOR Tendered", time: "2026-02-01 06:00", status: "completed" },
    { label: "NOR Accepted", time: "2026-02-01 08:00", status: "completed" },
    { label: "Free Pratique Granted", time: "2026-02-01 08:30", status: "completed" },
    { label: "Laytime Commenced", time: "2026-02-01 14:00", status: "completed" },
    { label: "Loading Started", time: "2026-02-01 14:30", status: "completed" },
    { label: "Loading Completed", time: "2026-02-03 14:00", status: "completed" },
    { label: "Laytime Expired", time: "2026-02-03 02:00", status: "demurrage" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="h-4 w-4" />
          NOR Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {norEvents.map((event, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${
                event.status === 'completed' ? 'bg-success' : 
                event.status === 'demurrage' ? 'bg-destructive' : 'bg-muted'
              }`} />
              <div className="flex-1">
                <p className="text-sm font-medium">{event.label}</p>
                <p className="text-xs text-muted-foreground">{event.time}</p>
              </div>
              {event.status === 'demurrage' && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Demurrage
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Main Component
export default function LaytimeDemurrageModule() {
  const [activeTab, setActiveTab] = useState("calculator");

  // Summary stats
  const totalDemurrage = 45250;
  const pendingClaims = 3;
  const avgLaytime = 42;

  return (
    <div className="space-y-6">
      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-destructive/10 to-transparent border-destructive/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">YTD Demurrage</p>
                <p className="text-2xl font-bold text-destructive">${(totalDemurrage / 1000).toFixed(1)}K</p>
              </div>
              <Timer className="h-8 w-8 text-destructive/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-success/10 to-transparent border-success/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">YTD Despatch</p>
                <p className="text-2xl font-bold text-success">$12.5K</p>
              </div>
              <TrendingUp className="h-8 w-8 text-success/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-warning/10 to-transparent border-warning/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pending Claims</p>
                <p className="text-2xl font-bold text-warning">{pendingClaims}</p>
              </div>
              <FileText className="h-8 w-8 text-warning/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Avg Laytime</p>
                <p className="text-2xl font-bold">{avgLaytime}h</p>
                <p className="text-xs text-muted-foreground">per port</p>
              </div>
              <Clock className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="sof">Statement of Facts</TabsTrigger>
          <TabsTrigger value="claims">Claims</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LaytimeCalculator />
            <NORTimeline />
          </div>
        </TabsContent>

        <TabsContent value="sof" className="mt-4">
          <StatementOfFacts events={fallbackSOF} />
        </TabsContent>

        <TabsContent value="claims" className="mt-4">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Demurrage/Despatch Claims</p>
              <p className="text-sm">Manage claims with charterers and track settlements</p>
              <Button className="mt-4">
                <FileText className="h-4 w-4 mr-2" />
                New Claim
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
