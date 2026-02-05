/**
 * Voyage P&L Calculator - TIER-1 Financial Analysis
 * Based on Veson IMOS, DNV Fleet Manager, PRIME Marine
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Ship, DollarSign, Fuel, Anchor, TrendingUp, TrendingDown,
  Calculator, FileText, BarChart3, Clock, MapPin, AlertTriangle,
  CheckCircle, ArrowRight, Percent
} from "lucide-react";

interface VoyagePnL {
  voyageNumber: string;
  vessel: string;
  route: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'in_progress' | 'completed';
  revenue: {
    freight: number;
    demurrage: number;
    other: number;
    total: number;
  };
  costs: {
    bunker: number;
    portCharges: number;
    canalDues: number;
    agency: number;
    stevedoring: number;
    insurance: number;
    crewing: number;
    provisions: number;
    other: number;
    total: number;
  };
  grossProfit: number;
  margin: number;
  tce: number;
  voyageDays: number;
  seaDays: number;
  portDays: number;
}

// Mock voyage data
const mockVoyages: VoyagePnL[] = [
  {
    voyageNumber: "V-2026-001",
    vessel: "MV Nautilus One",
    route: "Santos → Rotterdam",
    startDate: "2026-01-15",
    endDate: "2026-02-05",
    status: "completed",
    revenue: {
      freight: 485000,
      demurrage: 12500,
      other: 5000,
      total: 502500
    },
    costs: {
      bunker: 185000,
      portCharges: 42000,
      canalDues: 0,
      agency: 8500,
      stevedoring: 35000,
      insurance: 15000,
      crewing: 52000,
      provisions: 8000,
      other: 12000,
      total: 357500
    },
    grossProfit: 145000,
    margin: 28.9,
    tce: 18250,
    voyageDays: 21,
    seaDays: 16,
    portDays: 5
  },
  {
    voyageNumber: "V-2026-002",
    vessel: "MV Nautilus One",
    route: "Rotterdam → New Orleans",
    startDate: "2026-02-10",
    endDate: "2026-03-05",
    status: "in_progress",
    revenue: {
      freight: 520000,
      demurrage: 0,
      other: 3500,
      total: 523500
    },
    costs: {
      bunker: 210000,
      portCharges: 38000,
      canalDues: 0,
      agency: 9200,
      stevedoring: 40000,
      insurance: 15000,
      crewing: 58000,
      provisions: 9500,
      other: 15000,
      total: 394700
    },
    grossProfit: 128800,
    margin: 24.6,
    tce: 16100,
    voyageDays: 23,
    seaDays: 18,
    portDays: 5
  }
];

// TCE Calculator Component
function TCECalculator() {
  const [formData, setFormData] = useState({
    freight: 500000,
    addressCommission: 3.75,
    voyageExpenses: 350000,
    voyageDays: 21
  });

  const netFreight = formData.freight * (1 - formData.addressCommission / 100);
  const tce = (netFreight - formData.voyageExpenses) / formData.voyageDays;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          TCE Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Gross Freight (USD)</Label>
            <Input
              type="number"
              value={formData.freight}
              onChange={e => setFormData({ ...formData, freight: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label className="text-xs">Address Commission (%)</Label>
            <Input
              type="number"
              step="0.25"
              value={formData.addressCommission}
              onChange={e => setFormData({ ...formData, addressCommission: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label className="text-xs">Voyage Expenses (USD)</Label>
            <Input
              type="number"
              value={formData.voyageExpenses}
              onChange={e => setFormData({ ...formData, voyageExpenses: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label className="text-xs">Voyage Days</Label>
            <Input
              type="number"
              value={formData.voyageDays}
              onChange={e => setFormData({ ...formData, voyageDays: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-primary/10 to-transparent rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Net Freight</p>
              <p className="text-lg font-medium">${netFreight.toLocaleString()}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Time Charter Equivalent</p>
              <p className="text-2xl font-bold text-primary">${tce.toLocaleString()}/day</p>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>Formula: TCE = (Net Freight - Voyage Expenses) / Voyage Days</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Voyage Detail Card
function VoyageDetailCard({ voyage }: { voyage: VoyagePnL }) {
  const isProfit = voyage.grossProfit > 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ship className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-base">{voyage.voyageNumber}</CardTitle>
              <p className="text-xs text-muted-foreground">{voyage.vessel}</p>
            </div>
          </div>
          <Badge variant={voyage.status === 'completed' ? 'default' : 'secondary'}>
            {voyage.status === 'completed' ? 'Completed' : 'In Progress'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Route */}
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>{voyage.route}</span>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{voyage.voyageDays} days total</span>
          </div>
          <span>•</span>
          <span>{voyage.seaDays}d sea</span>
          <span>•</span>
          <span>{voyage.portDays}d port</span>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-2 rounded bg-success/10">
            <p className="text-xs text-muted-foreground">Revenue</p>
            <p className="font-bold text-success">${voyage.revenue.total.toLocaleString()}</p>
          </div>
          <div className="p-2 rounded bg-destructive/10">
            <p className="text-xs text-muted-foreground">Costs</p>
            <p className="font-bold text-destructive">${voyage.costs.total.toLocaleString()}</p>
          </div>
        </div>

        {/* Profit & Margin */}
        <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Gross Profit</p>
              <p className={`text-xl font-bold ${isProfit ? 'text-success' : 'text-destructive'}`}>
                ${voyage.grossProfit.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Margin</p>
              <div className="flex items-center gap-1">
                {isProfit ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
                <span className={`font-bold ${isProfit ? 'text-success' : 'text-destructive'}`}>
                  {voyage.margin.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* TCE */}
        <div className="flex items-center justify-between p-2 border rounded">
          <span className="text-sm font-medium">TCE Rate</span>
          <Badge variant="outline" className="font-mono">
            ${voyage.tce.toLocaleString()}/day
          </Badge>
        </div>

        <Button variant="outline" size="sm" className="w-full">
          <BarChart3 className="h-4 w-4 mr-2" />
          View Full P&L
        </Button>
      </CardContent>
    </Card>
  );
}

// Cost Breakdown Component
function CostBreakdown({ voyage }: { voyage: VoyagePnL }) {
  const costItems = [
    { name: "Bunker/Fuel", value: voyage.costs.bunker, color: "bg-orange-500" },
    { name: "Port Charges", value: voyage.costs.portCharges, color: "bg-blue-500" },
    { name: "Crewing", value: voyage.costs.crewing, color: "bg-green-500" },
    { name: "Stevedoring", value: voyage.costs.stevedoring, color: "bg-purple-500" },
    { name: "Insurance", value: voyage.costs.insurance, color: "bg-pink-500" },
    { name: "Agency", value: voyage.costs.agency, color: "bg-cyan-500" },
    { name: "Provisions", value: voyage.costs.provisions, color: "bg-yellow-500" },
    { name: "Other", value: voyage.costs.other, color: "bg-gray-500" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Cost Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {costItems.map(item => {
          const percentage = (item.value / voyage.costs.total) * 100;
          return (
            <div key={item.name} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>{item.name}</span>
                <span className="font-medium">${item.value.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={percentage} className="h-2" />
                <span className="text-xs text-muted-foreground w-12 text-right">
                  {percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
        <div className="pt-2 border-t flex items-center justify-between font-bold">
          <span>Total Costs</span>
          <span className="text-destructive">${voyage.costs.total.toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Component
export default function VoyagePnLCalculator() {
  const [selectedVoyage, setSelectedVoyage] = useState<VoyagePnL>(mockVoyages[0]);

  // Summary stats
  const totalRevenue = mockVoyages.reduce((acc, v) => acc + v.revenue.total, 0);
  const totalCosts = mockVoyages.reduce((acc, v) => acc + v.costs.total, 0);
  const totalProfit = mockVoyages.reduce((acc, v) => acc + v.grossProfit, 0);
  const avgTCE = mockVoyages.reduce((acc, v) => acc + v.tce, 0) / mockVoyages.length;

  return (
    <div className="space-y-6">
      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-success/10 to-transparent border-success/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-success">${(totalRevenue / 1000).toFixed(0)}K</p>
              </div>
              <DollarSign className="h-8 w-8 text-success/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-destructive/10 to-transparent border-destructive/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Costs</p>
                <p className="text-2xl font-bold text-destructive">${(totalCosts / 1000).toFixed(0)}K</p>
              </div>
              <TrendingDown className="h-8 w-8 text-destructive/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Gross Profit</p>
                <p className="text-2xl font-bold text-primary">${(totalProfit / 1000).toFixed(0)}K</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-violet-500/10 to-transparent border-violet-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Avg TCE</p>
                <p className="text-2xl font-bold">${avgTCE.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">per day</p>
              </div>
              <Ship className="h-8 w-8 text-violet-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Voyage List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Voyage P&L Analysis</h3>
            <Button size="sm">
              <FileText className="h-4 w-4 mr-2" />
              New Voyage Estimate
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockVoyages.map(voyage => (
              <div key={voyage.voyageNumber} onClick={() => setSelectedVoyage(voyage)}>
                <VoyageDetailCard voyage={voyage} />
              </div>
            ))}
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          <TCECalculator />
          <CostBreakdown voyage={selectedVoyage} />
        </div>
      </div>
    </div>
  );
}
