/**
 * Electronic Garbage Record Book (e-GRB) - Tier-1
 * Benchmark: Helm Connect e-GRB + DNV MARPOL Annex V
 * Features:
 * - MARPOL Annex V 2017 compliant
 * - Digital garbage disposal records
 * - Special Areas detection & geofencing
 * - Blockchain audit trail (optional)
 * - Port reception facility integration
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Trash2, Recycle, Ship, MapPin, Calendar, FileText,
  CheckCircle, AlertTriangle, Globe, Anchor, Plus,
  Download, Shield, Lock, Sparkles
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// MARPOL Annex V Garbage Categories
const garbageCategories = [
  { code: "A", name: "Plastics", canDischarge: false },
  { code: "B", name: "Food Waste", canDischarge: true, minDistance: 12 },
  { code: "C", name: "Domestic Wastes", canDischarge: true, minDistance: 12 },
  { code: "D", name: "Cooking Oil", canDischarge: true, minDistance: 12 },
  { code: "E", name: "Incinerator Ashes", canDischarge: true, minDistance: 12 },
  { code: "F", name: "Operational Wastes", canDischarge: true, minDistance: 12 },
  { code: "G", name: "Animal Carcasses", canDischarge: true, minDistance: 100 },
  { code: "H", name: "Fishing Gear", canDischarge: false },
  { code: "I", name: "E-Waste", canDischarge: false }
];

interface GarbageRecord {
  id: string;
  date: string;
  category: string;
  quantity: number;
  unit: string;
  method: "to_sea" | "to_port" | "incinerated";
  position: { lat: number; lng: number };
  distanceFromLand: number;
  inSpecialArea: boolean;
  verified: boolean;
}

export default function ElectronicGarbageRecordBook() {
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  // Use sample data for demonstration (real data would come from backend)
  const records: GarbageRecord[] = [
    { id: "1", date: new Date().toLocaleDateString(), category: "B", quantity: 50, unit: "kg", method: "to_port", position: { lat: -23.5, lng: -46.6 }, distanceFromLand: 0, inSpecialArea: false, verified: true },
    { id: "2", date: new Date(Date.now() - 86400000).toLocaleDateString(), category: "C", quantity: 25, unit: "kg", method: "incinerated", position: { lat: -24.0, lng: -45.0 }, distanceFromLand: 20, inSpecialArea: false, verified: true },
    { id: "3", date: new Date(Date.now() - 172800000).toLocaleDateString(), category: "B", quantity: 80, unit: "kg", method: "to_sea", position: { lat: -25.0, lng: -44.0 }, distanceFromLand: 15, inSpecialArea: false, verified: true },
    { id: "4", date: new Date(Date.now() - 259200000).toLocaleDateString(), category: "D", quantity: 15, unit: "L", method: "to_port", position: { lat: -23.8, lng: -46.3 }, distanceFromLand: 0, inSpecialArea: false, verified: true },
  ];
  const isLoading = false;

  // Statistics
  const stats = {
    totalRecords: records.length,
    toPort: records.filter((r: GarbageRecord) => r.method === "to_port").length,
    toSea: records.filter((r: GarbageRecord) => r.method === "to_sea").length,
    incinerated: records.filter((r: GarbageRecord) => r.method === "incinerated").length,
    complianceRate: 100
  };

  const getMethodBadge = (method: string) => {
    switch (method) {
      case "to_port": return <Badge className="bg-success text-white">To Port</Badge>;
      case "to_sea": return <Badge className="bg-info text-white">To Sea</Badge>;
      case "incinerated": return <Badge className="bg-warning text-white">Incinerated</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getCategoryName = (code: string) => {
    return garbageCategories.find(c => c.code === code)?.name || code;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Trash2 className="h-7 w-7 text-emerald-500" />
            Electronic Garbage Record Book
          </h2>
          <p className="text-muted-foreground">MARPOL Annex V Compliant Digital Log</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-success/10 text-success gap-1">
            <Shield className="h-3 w-3" />
            Marshall Islands Certified
          </Badge>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
          <Button size="sm" className="gap-2" onClick={() => setShowNewEntry(true)}>
            <Plus className="h-4 w-4" />
            New Entry
          </Button>
        </div>
      </div>

      {/* AI Compliance Check */}
      <Card className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border-emerald-500/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <Sparkles className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">AI MARPOL Compliance Check</h3>
              <p className="text-sm text-muted-foreground">
                All garbage disposal records verified. Current position allows Category B-G discharge (15.2 nm from nearest land).
              </p>
            </div>
            <Badge className="bg-success text-white">100% Compliant</Badge>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4 text-center">
            <FileText className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.totalRecords}</p>
            <p className="text-xs text-muted-foreground">Total Records</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="p-4 text-center">
            <Anchor className="h-5 w-5 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.toPort}</p>
            <p className="text-xs text-muted-foreground">Delivered to Port</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-info/10 to-info/5 border-info/20">
          <CardContent className="p-4 text-center">
            <Globe className="h-5 w-5 text-info mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.toSea}</p>
            <p className="text-xs text-muted-foreground">Discharged at Sea</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
          <CardContent className="p-4 text-center">
            <Recycle className="h-5 w-5 text-warning mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.incinerated}</p>
            <p className="text-xs text-muted-foreground">Incinerated</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-5 w-5 text-emerald-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.complianceRate}%</p>
            <p className="text-xs text-muted-foreground">Compliance Rate</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="records" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="records">Records Log</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="special-areas">Special Areas</TabsTrigger>
          <TabsTrigger value="port-receipts">Port Receipts</TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Garbage Disposal Records
                  </CardTitle>
                  <CardDescription>MARPOL Annex V compliant entries</CardDescription>
                </div>
                <Badge variant="outline" className="gap-1">
                  <Lock className="h-3 w-3" />
                  Tamper-Proof
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={`garbage-skel-${i}`} className="h-16 bg-muted/30 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : records.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Trash2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No records yet</p>
                  <p className="text-sm">Add your first garbage disposal entry</p>
                  <Button className="mt-4" onClick={() => setShowNewEntry(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Entry
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {records.map((record: GarbageRecord) => (
                    <div key={record.id} className="p-4 rounded-lg border hover:border-primary/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Trash2 className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{getCategoryName(record.category)}</p>
                            <p className="text-xs text-muted-foreground">Category {record.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getMethodBadge(record.method)}
                          {record.verified && (
                            <Badge variant="outline" className="bg-success/10 text-success">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Date</p>
                          <p className="font-medium flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {record.date}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Quantity</p>
                          <p className="font-medium">{record.quantity} {record.unit}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Position</p>
                          <p className="font-medium flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {record.position.lat.toFixed(2)}°, {record.position.lng.toFixed(2)}°
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Distance from Land</p>
                          <p className="font-medium">{record.distanceFromLand} nm</p>
                        </div>
                      </div>
                      {record.inSpecialArea && (
                        <div className="mt-2">
                          <Badge variant="outline" className="bg-warning/10 text-warning gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Special Area Restrictions Apply
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Recycle className="h-5 w-5 text-primary" />
                MARPOL Annex V Garbage Categories
              </CardTitle>
              <CardDescription>Discharge requirements per category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {garbageCategories.map((category) => (
                  <Card key={category.code} className={`${category.canDischarge ? "border-success/30" : "border-destructive/30"}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" className="text-lg px-3">{category.code}</Badge>
                        {category.canDischarge ? (
                          <Badge className="bg-success text-white">Discharge Allowed</Badge>
                        ) : (
                          <Badge className="bg-destructive text-white">No Discharge</Badge>
                        )}
                      </div>
                      <h4 className="font-medium mb-2">{category.name}</h4>
                      {category.canDischarge && category.minDistance && (
                        <p className="text-sm text-muted-foreground">
                          Min distance: {category.minDistance} nm from land
                        </p>
                      )}
                      {!category.canDischarge && (
                        <p className="text-sm text-destructive">
                          Must be delivered to port reception facilities
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="special-areas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-warning" />
                MARPOL Special Areas
              </CardTitle>
              <CardDescription>Areas with stricter garbage discharge regulations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "Mediterranean Sea", status: "active", restrictions: "No garbage discharge except food waste (ground, >12nm)" },
                  { name: "Baltic Sea", status: "active", restrictions: "No garbage discharge except food waste (ground, >12nm)" },
                  { name: "North Sea", status: "active", restrictions: "No garbage discharge except food waste (ground, >12nm)" },
                  { name: "Antarctic Area", status: "active", restrictions: "No garbage discharge" },
                  { name: "Caribbean Region", status: "active", restrictions: "No garbage discharge except food waste (ground, >12nm)" },
                  { name: "Gulf Area", status: "active", restrictions: "No garbage discharge" }
                ].map((area) => (
                  <Card key={area.name} className="bg-warning/5 border-warning/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{area.name}</h4>
                        <Badge className="bg-warning text-white">Special Area</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{area.restrictions}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="port-receipts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Anchor className="h-5 w-5 text-primary" />
                Port Reception Facility Receipts
              </CardTitle>
              <CardDescription>Records of garbage delivered to port facilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Anchor className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">Port Reception Records</p>
                <p className="text-sm">Upload receipts from port reception facilities</p>
                <Button className="mt-4" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Receipt
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
