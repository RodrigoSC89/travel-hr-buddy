/**
 * Carbon Intensity Indicator (CII) Module
 * IMO 2023+ Compliance - EEXI/CII Tracking
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Leaf, 
  TrendingDown, 
  AlertTriangle, 
  Target,
  Ship,
  Fuel,
  Wind,
  BarChart3,
  FileText,
  Download
} from "lucide-react";

interface VesselCII {
  vesselId: string;
  vesselName: string;
  imoNumber: string;
  vesselType: string;
  dwt: number;
  currentCII: number;
  requiredCII: number;
  rating: 'A' | 'B' | 'C' | 'D' | 'E';
  trend: 'improving' | 'stable' | 'declining';
  yearToDate: {
    totalCO2: number; // tonnes
    totalDistance: number; // nm
    totalCargo: number; // tonnes
    attainedCII: number;
  };
  projectedRating: 'A' | 'B' | 'C' | 'D' | 'E';
  correctionFactors: {
    iceClass: number;
    voluntaryReduction: number;
    electricalPower: number;
  };
}

interface CIIDecarbonizationMeasure {
  id: string;
  measure: string;
  category: 'operational' | 'technical' | 'alternative_fuel';
  estimatedReduction: number; // % CII reduction
  implementationCost: number;
  paybackPeriod: number; // months
  status: 'proposed' | 'approved' | 'implementing' | 'completed';
  priority: 'high' | 'medium' | 'low';
}

const fallbackVesselCII: VesselCII[] = [
  {
    vesselId: "v1",
    vesselName: "MV Atlantic Pioneer",
    imoNumber: "9876543",
    vesselType: "Bulk Carrier",
    dwt: 82000,
    currentCII: 4.2,
    requiredCII: 5.1,
    rating: 'B',
    trend: 'improving',
    yearToDate: {
      totalCO2: 12500,
      totalDistance: 45000,
      totalCargo: 3200000,
      attainedCII: 4.2
    },
    projectedRating: 'A',
    correctionFactors: {
      iceClass: 0,
      voluntaryReduction: 0.02,
      electricalPower: 0
    }
  },
  {
    vesselId: "v2",
    vesselName: "MV Pacific Star",
    imoNumber: "9876544",
    vesselType: "Container Ship",
    dwt: 65000,
    currentCII: 6.8,
    requiredCII: 5.5,
    rating: 'D',
    trend: 'declining',
    yearToDate: {
      totalCO2: 18200,
      totalDistance: 52000,
      totalCargo: 2100000,
      attainedCII: 6.8
    },
    projectedRating: 'E',
    correctionFactors: {
      iceClass: 0,
      voluntaryReduction: 0,
      electricalPower: 0
    }
  },
  {
    vesselId: "v3",
    vesselName: "MV Nordic Wind",
    imoNumber: "9876545",
    vesselType: "Tanker",
    dwt: 115000,
    currentCII: 3.1,
    requiredCII: 4.8,
    rating: 'A',
    trend: 'stable',
    yearToDate: {
      totalCO2: 9800,
      totalDistance: 38000,
      totalCargo: 4500000,
      attainedCII: 3.1
    },
    projectedRating: 'A',
    correctionFactors: {
      iceClass: 0.05,
      voluntaryReduction: 0.03,
      electricalPower: 0.02
    }
  }
];

const decarbonizationMeasures: CIIDecarbonizationMeasure[] = [
  {
    id: "m1",
    measure: "Speed Reduction Program",
    category: "operational",
    estimatedReduction: 15,
    implementationCost: 0,
    paybackPeriod: 0,
    status: "implementing",
    priority: "high"
  },
  {
    id: "m2",
    measure: "Hull & Propeller Cleaning",
    category: "technical",
    estimatedReduction: 8,
    implementationCost: 150000,
    paybackPeriod: 6,
    status: "completed",
    priority: "high"
  },
  {
    id: "m3",
    measure: "Air Lubrication System",
    category: "technical",
    estimatedReduction: 5,
    implementationCost: 2500000,
    paybackPeriod: 48,
    status: "proposed",
    priority: "medium"
  },
  {
    id: "m4",
    measure: "LNG Fuel Conversion",
    category: "alternative_fuel",
    estimatedReduction: 25,
    implementationCost: 15000000,
    paybackPeriod: 72,
    status: "approved",
    priority: "high"
  },
  {
    id: "m5",
    measure: "Wind-Assisted Propulsion (Rotor Sails)",
    category: "technical",
    estimatedReduction: 10,
    implementationCost: 4000000,
    paybackPeriod: 36,
    status: "proposed",
    priority: "medium"
  }
];

const getRatingColor = (rating: string) => {
  switch (rating) {
    case 'A': return 'bg-green-500';
    case 'B': return 'bg-lime-500';
    case 'C': return 'bg-yellow-500';
    case 'D': return 'bg-orange-500';
    case 'E': return 'bg-red-500';
    default: return 'bg-muted';
  }
};

const getRatingBadge = (rating: string) => {
  switch (rating) {
    case 'A': return 'default';
    case 'B': return 'default';
    case 'C': return 'secondary';
    case 'D': return 'destructive';
    case 'E': return 'destructive';
    default: return 'outline';
  }
};

export function CarbonIntensityIndicator() {
  const [selectedVessel, setSelectedVessel] = useState<VesselCII | null>(fallbackVesselCII[0]);

  const fleetStats = {
    avgCII: fallbackVesselCII.reduce((acc, v) => acc + v.currentCII, 0) / fallbackVesselCII.length,
    compliantVessels: fallbackVesselCII.filter(v => ['A', 'B', 'C'].includes(v.rating)).length,
    totalVessels: fallbackVesselCII.length,
    totalCO2YTD: fallbackVesselCII.reduce((acc, v) => acc + v.yearToDate.totalCO2, 0),
    atRiskVessels: fallbackVesselCII.filter(v => ['D', 'E'].includes(v.rating)).length
  };

  return (
    <div className="space-y-6">
      {/* Fleet CII Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-500" />
              <span className="text-sm text-muted-foreground">Fleet Avg CII</span>
            </div>
            <p className="text-2xl font-bold mt-2">{fleetStats.avgCII.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">gCO₂/dwt·nm</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-muted-foreground">Compliant Vessels</span>
            </div>
            <p className="text-2xl font-bold mt-2">
              {fleetStats.compliantVessels}/{fleetStats.totalVessels}
            </p>
            <Progress 
              value={(fleetStats.compliantVessels / fleetStats.totalVessels) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span className="text-sm text-muted-foreground">At Risk (D/E)</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-orange-500">{fleetStats.atRiskVessels}</p>
            <p className="text-xs text-muted-foreground">Require immediate action</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Fuel className="h-5 w-5 text-purple-500" />
              <span className="text-sm text-muted-foreground">Total CO₂ YTD</span>
            </div>
            <p className="text-2xl font-bold mt-2">{(fleetStats.totalCO2YTD / 1000).toFixed(1)}k</p>
            <p className="text-xs text-muted-foreground">tonnes</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-green-500" />
              <span className="text-sm text-muted-foreground">YoY Reduction</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-green-500">-8.2%</p>
            <p className="text-xs text-muted-foreground">vs. 2024</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="vessels" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vessels">
            <Ship className="h-4 w-4 mr-2" />
            Vessel CII Ratings
          </TabsTrigger>
          <TabsTrigger value="measures">
            <Wind className="h-4 w-4 mr-2" />
            Decarbonization Measures
          </TabsTrigger>
          <TabsTrigger value="simop">
            <BarChart3 className="h-4 w-4 mr-2" />
            SEEMP Part III
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="h-4 w-4 mr-2" />
            IMO DCS Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vessels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ship className="h-5 w-5" />
                Fleet CII Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fallbackVesselCII.map((vessel) => (
                  <div 
                    key={vessel.vesselId}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedVessel?.vesselId === vessel.vesselId 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedVessel(vessel)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full ${getRatingColor(vessel.rating)} flex items-center justify-center text-white font-bold text-xl`}>
                          {vessel.rating}
                        </div>
                        <div>
                          <p className="font-semibold">{vessel.vesselName}</p>
                          <p className="text-sm text-muted-foreground">
                            IMO {vessel.imoNumber} • {vessel.vesselType} • {vessel.dwt.toLocaleString()} DWT
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Attained:</span>
                          <span className="font-bold">{vessel.currentCII.toFixed(2)}</span>
                          <span className="text-sm text-muted-foreground">/ Required:</span>
                          <span className="font-bold">{vessel.requiredCII.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-muted-foreground">Projected:</span>
                          <Badge variant={getRatingBadge(vessel.projectedRating) as "default" | "destructive" | "outline" | "secondary"}>
                            {vessel.projectedRating}
                          </Badge>
                          {vessel.trend === 'improving' && (
                            <Badge variant="outline" className="text-green-500 border-green-500">↑ Improving</Badge>
                          )}
                          {vessel.trend === 'declining' && (
                            <Badge variant="outline" className="text-red-500 border-red-500">↓ Declining</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {selectedVessel?.vesselId === vessel.vesselId && (
                      <div className="mt-4 pt-4 border-t grid grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Total CO₂ YTD</p>
                          <p className="font-bold">{vessel.yearToDate.totalCO2.toLocaleString()} t</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Distance YTD</p>
                          <p className="font-bold">{vessel.yearToDate.totalDistance.toLocaleString()} nm</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Cargo YTD</p>
                          <p className="font-bold">{(vessel.yearToDate.totalCargo / 1000000).toFixed(1)}M t</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Correction Factors</p>
                          <p className="font-bold">
                            {((vessel.correctionFactors.iceClass + 
                               vessel.correctionFactors.voluntaryReduction + 
                               vessel.correctionFactors.electricalPower) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="measures" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wind className="h-5 w-5" />
                Decarbonization Measures Portfolio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {decarbonizationMeasures.map((measure) => (
                  <div key={measure.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{measure.measure}</p>
                          <Badge variant={
                            measure.category === 'operational' ? 'default' :
                            measure.category === 'technical' ? 'secondary' : 'outline'
                          }>
                            {measure.category.replace('_', ' ')}
                          </Badge>
                          <Badge variant={
                            measure.priority === 'high' ? 'destructive' :
                            measure.priority === 'medium' ? 'secondary' : 'outline'
                          }>
                            {measure.priority} priority
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>CII Reduction: <strong className="text-green-500">-{measure.estimatedReduction}%</strong></span>
                          <span>Cost: <strong>${(measure.implementationCost / 1000000).toFixed(1)}M</strong></span>
                          <span>Payback: <strong>{measure.paybackPeriod} months</strong></span>
                        </div>
                      </div>
                      <Badge variant={
                        measure.status === 'completed' ? 'default' :
                        measure.status === 'implementing' ? 'secondary' :
                        measure.status === 'approved' ? 'outline' : 'outline'
                      }>
                        {measure.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simop" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SEEMP Part III - Ship Implementation Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  SEEMP Part III documents required for vessels rated D or E for 3 consecutive years
                </p>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Generate SEEMP Part III
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>IMO Data Collection System (DCS) Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Annual Fuel Consumption Report 2025</p>
                    <p className="text-sm text-muted-foreground">Due: March 31, 2026</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge>Draft</Badge>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
                <div className="p-4 border rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Statement of Compliance 2024</p>
                    <p className="text-sm text-muted-foreground">Submitted: January 15, 2025</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="default">Verified</Badge>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
