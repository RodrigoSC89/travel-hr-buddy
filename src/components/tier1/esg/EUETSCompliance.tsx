/**
 * EU ETS Maritime Compliance Module
 * EU Emissions Trading System for Shipping (2024+)
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Euro, 
  Ship, 
  TrendingUp, 
  Calendar,
  AlertTriangle,
  FileText,
  Calculator,
  Wallet,
  BarChart3,
  Download
} from "lucide-react";

interface VoyageEmission {
  voyageId: string;
  vesselName: string;
  departure: string;
  arrival: string;
  departurePort: string;
  arrivalPort: string;
  voyageType: 'intra-eu' | 'eu-departure' | 'eu-arrival' | 'non-eu';
  applicablePercent: 100 | 50 | 0;
  co2Emissions: number; // tonnes
  euaCost: number; // EUR
  verified: boolean;
}

interface EUAPosition {
  year: number;
  totalEmissions: number; // tonnes CO2
  phaseInPercent: number; // 40% (2024), 70% (2025), 100% (2026+)
  euasRequired: number;
  euasHeld: number;
  euaPrice: number; // EUR per tonne
  totalCost: number;
  surrenderDeadline: Date;
  status: 'compliant' | 'shortfall' | 'surplus';
}

const fallbackVoyages: VoyageEmission[] = [
  {
    voyageId: "V2025-001",
    vesselName: "MV Atlantic Pioneer",
    departure: "2025-01-15",
    arrival: "2025-01-22",
    departurePort: "Rotterdam, NL",
    arrivalPort: "Hamburg, DE",
    voyageType: "intra-eu",
    applicablePercent: 100,
    co2Emissions: 1250,
    euaCost: 87500,
    verified: true
  },
  {
    voyageId: "V2025-002",
    vesselName: "MV Atlantic Pioneer",
    departure: "2025-01-25",
    arrival: "2025-02-05",
    departurePort: "Hamburg, DE",
    arrivalPort: "Singapore, SG",
    voyageType: "eu-departure",
    applicablePercent: 50,
    co2Emissions: 4800,
    euaCost: 168000,
    verified: true
  },
  {
    voyageId: "V2025-003",
    vesselName: "MV Pacific Star",
    departure: "2025-02-10",
    arrival: "2025-02-18",
    departurePort: "Shanghai, CN",
    arrivalPort: "Antwerp, BE",
    voyageType: "eu-arrival",
    applicablePercent: 50,
    co2Emissions: 5200,
    euaCost: 182000,
    verified: false
  },
  {
    voyageId: "V2025-004",
    vesselName: "MV Nordic Wind",
    departure: "2025-02-20",
    arrival: "2025-02-28",
    departurePort: "Singapore, SG",
    arrivalPort: "Tokyo, JP",
    voyageType: "non-eu",
    applicablePercent: 0,
    co2Emissions: 3100,
    euaCost: 0,
    verified: true
  }
];

const euaPosition: EUAPosition = {
  year: 2025,
  totalEmissions: 45000,
  phaseInPercent: 70,
  euasRequired: 31500, // 45000 * 0.70
  euasHeld: 28000,
  euaPrice: 70,
  totalCost: 2205000,
  surrenderDeadline: new Date('2026-09-30'),
  status: 'shortfall'
};

export function EUETSCompliance() {
  const [selectedYear, setSelectedYear] = useState(2025);

  const shortfall = euaPosition.euasRequired - euaPosition.euasHeld;
  const shortfallCost = shortfall * euaPosition.euaPrice;

  const voyageStats = {
    intraEU: fallbackVoyages.filter(v => v.voyageType === 'intra-eu').length,
    euDeparture: fallbackVoyages.filter(v => v.voyageType === 'eu-departure').length,
    euArrival: fallbackVoyages.filter(v => v.voyageType === 'eu-arrival').length,
    nonEU: fallbackVoyages.filter(v => v.voyageType === 'non-eu').length,
    totalEUACost: fallbackVoyages.reduce((acc, v) => acc + v.euaCost, 0),
    unverified: fallbackVoyages.filter(v => !v.verified).length
  };

  return (
    <div className="space-y-6">
      {/* EU ETS Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Ship className="h-5 w-5 text-info" />
              <span className="text-sm text-muted-foreground">EU Voyages YTD</span>
            </div>
            <p className="text-2xl font-bold mt-2">
              {voyageStats.intraEU + voyageStats.euDeparture + voyageStats.euArrival}
            </p>
            <p className="text-xs text-muted-foreground">
              {voyageStats.intraEU} intra-EU | {voyageStats.euDeparture + voyageStats.euArrival} partial
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Euro className="h-5 w-5 text-success" />
              <span className="text-sm text-muted-foreground">EUA Price</span>
            </div>
            <p className="text-2xl font-bold mt-2">€{euaPosition.euaPrice}</p>
            <p className="text-xs text-success">+2.3% this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-accent-foreground" />
              <span className="text-sm text-muted-foreground">EUAs Held</span>
            </div>
            <p className="text-2xl font-bold mt-2">{euaPosition.euasHeld.toLocaleString()}</p>
            <Progress 
              value={(euaPosition.euasHeld / euaPosition.euasRequired) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card className={shortfall > 0 ? 'border-warning' : ''}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`h-5 w-5 ${shortfall > 0 ? 'text-warning' : 'text-success'}`} />
              <span className="text-sm text-muted-foreground">Shortfall</span>
            </div>
            <p className={`text-2xl font-bold mt-2 ${shortfall > 0 ? 'text-warning' : 'text-success'}`}>
              {shortfall > 0 ? shortfall.toLocaleString() : 'None'}
            </p>
            {shortfall > 0 && (
              <p className="text-xs text-muted-foreground">€{shortfallCost.toLocaleString()} to cover</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-destructive" />
              <span className="text-sm text-muted-foreground">Surrender Deadline</span>
            </div>
            <p className="text-2xl font-bold mt-2">Sep 30</p>
            <p className="text-xs text-muted-foreground">2026</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="voyages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="voyages">
            <Ship className="h-4 w-4 mr-2" />
            Voyage Emissions
          </TabsTrigger>
          <TabsTrigger value="position">
            <Wallet className="h-4 w-4 mr-2" />
            EUA Position
          </TabsTrigger>
          <TabsTrigger value="forecast">
            <TrendingUp className="h-4 w-4 mr-2" />
            Cost Forecast
          </TabsTrigger>
          <TabsTrigger value="mrv">
            <FileText className="h-4 w-4 mr-2" />
            EU MRV Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="voyages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ship className="h-5 w-5" />
                  EU ETS Applicable Voyages
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">{voyageStats.unverified} unverified</Badge>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fallbackVoyages.map((voyage) => (
                  <div key={voyage.voyageId} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{voyage.voyageId}</p>
                          <Badge variant={
                            voyage.voyageType === 'intra-eu' ? 'default' :
                            voyage.voyageType === 'non-eu' ? 'secondary' : 'outline'
                          }>
                            {voyage.voyageType === 'intra-eu' ? '100% EU' :
                             voyage.voyageType === 'non-eu' ? '0% EU' : '50% EU'}
                          </Badge>
                          {!voyage.verified && (
                            <Badge variant="destructive">Pending Verification</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {voyage.vesselName} • {voyage.departurePort} → {voyage.arrivalPort}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {voyage.departure} - {voyage.arrival}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{voyage.co2Emissions.toLocaleString()} t CO₂</p>
                        <p className={`text-sm ${voyage.euaCost > 0 ? 'text-warning' : 'text-muted-foreground'}`}>
                          {voyage.euaCost > 0 ? `€${voyage.euaCost.toLocaleString()}` : 'No EUA cost'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="position" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                EUA Position {selectedYear}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Phase-in Percentage</p>
                    <p className="text-3xl font-bold">{euaPosition.phaseInPercent}%</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      2024: 40% | 2025: 70% | 2026+: 100%
                    </p>
                  </div>
                  
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Emissions</p>
                    <p className="text-3xl font-bold">{euaPosition.totalEmissions.toLocaleString()} t</p>
                    <p className="text-xs text-muted-foreground">CO₂ from EU voyages</p>
                  </div>
                  
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">EUAs Required</p>
                    <p className="text-3xl font-bold">{euaPosition.euasRequired.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {euaPosition.totalEmissions.toLocaleString()} × {euaPosition.phaseInPercent}%
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">EUAs in Account</p>
                    <p className="text-3xl font-bold">{euaPosition.euasHeld.toLocaleString()}</p>
                    <Progress 
                      value={(euaPosition.euasHeld / euaPosition.euasRequired) * 100}
                      className="mt-2"
                    />
                  </div>
                  
                  <div className={`p-4 rounded-lg ${shortfall > 0 ? 'bg-warning/10 border border-warning' : 'bg-success/10 border border-success'}`}>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className={`text-3xl font-bold ${shortfall > 0 ? 'text-warning' : 'text-success'}`}>
                      {shortfall > 0 ? `${shortfall.toLocaleString()} Shortfall` : 'Compliant'}
                    </p>
                    {shortfall > 0 && (
                      <Button className="mt-2" size="sm">
                        <Calculator className="h-4 w-4 mr-2" />
                        Purchase EUAs
                      </Button>
                    )}
                  </div>
                  
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Cost Estimate</p>
                    <p className="text-3xl font-bold">€{euaPosition.totalCost.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      @ €{euaPosition.euaPrice}/EUA
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                EU ETS Cost Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">2024 (40%)</p>
                    <p className="text-2xl font-bold">€1.26M</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center border-primary">
                    <p className="text-sm text-muted-foreground">2025 (70%)</p>
                    <p className="text-2xl font-bold">€2.21M</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">2026 (100%)</p>
                    <p className="text-2xl font-bold text-warning">€3.15M</p>
                  </div>
                </div>

                <div className="p-4 bg-info/10 border border-info rounded-lg">
                  <p className="font-semibold text-info">💡 Cost Reduction Opportunities</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• Speed optimization: -15% emissions = €470K savings</li>
                    <li>• Shore power usage: -5% emissions = €157K savings</li>
                    <li>• Biofuel blending (24%): -8% emissions = €252K savings</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mrv" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>EU MRV Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Annual Emissions Report 2024</p>
                    <p className="text-sm text-muted-foreground">Verified by DNV</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge>Submitted</Badge>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
                <div className="p-4 border rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Document of Compliance 2025</p>
                    <p className="text-sm text-muted-foreground">Valid until Dec 31, 2025</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="default">Active</Badge>
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
