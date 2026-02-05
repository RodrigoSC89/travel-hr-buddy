/**
 * WasteManagementMARPOLPro - Gestão de Resíduos MARPOL Tier-1
 * Benchmark: Dockflow, Position Green, DNV Navigator
 * Features: e-GRB, ORB, Tank visualization, Blockchain audit
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import {
  Trash2, Recycle, Droplets, Ship, FileText, Download,
  CheckCircle2, Clock, AlertTriangle, Plus, Edit, Eye,
  Anchor, MapPin, Calendar, User, Shield, Lock, Hash,
  BarChart3, TrendingUp, TrendingDown, Thermometer,
  Waves, Fuel, Package, Leaf, Target, ChevronRight
} from "lucide-react";
import { toast } from "sonner";

// Types
interface WasteTank {
  id: string;
  name: string;
  type: 'sludge' | 'bilge' | 'sewage' | 'garbage';
  capacity: number;
  current: number;
  unit: 'm³' | 'kg';
  status: 'normal' | 'warning' | 'critical';
  lastDischarge: string;
  location: string;
}

interface GarbageRecord {
  id: string;
  date: string;
  time: string;
  category: string;
  categoryCode: string;
  quantity: number;
  unit: string;
  method: 'discharged_at_sea' | 'discharged_to_reception' | 'incinerated';
  location?: {
    lat: number;
    lng: number;
    distanceFromLand: number;
  };
  port?: string;
  receiptNumber?: string;
  signedBy: string;
  remarks?: string;
  blockchainHash?: string;
}

interface OilRecord {
  id: string;
  date: string;
  time: string;
  category: string;
  operationType: string;
  tankId: string;
  tankName: string;
  quantity: number;
  retainedOnBoard: number;
  dischargedToShore: number;
  incineratedOrDisposed: number;
  position?: { lat: number; lng: number };
  signedBy: string;
  counterSignedBy?: string;
  blockchainHash?: string;
}

// Mock data
const wasteTanks: WasteTank[] = [
  { id: "1", name: "Sludge Tank P", type: "sludge", capacity: 15, current: 12.5, unit: "m³", status: "warning", lastDischarge: "2026-01-15", location: "Engine Room" },
  { id: "2", name: "Sludge Tank S", type: "sludge", capacity: 15, current: 8.2, unit: "m³", status: "normal", lastDischarge: "2026-01-15", location: "Engine Room" },
  { id: "3", name: "Bilge Holding Tank", type: "bilge", capacity: 25, current: 18.7, unit: "m³", status: "normal", lastDischarge: "2026-01-20", location: "Engine Room" },
  { id: "4", name: "Sewage Tank", type: "sewage", capacity: 20, current: 19.5, unit: "m³", status: "critical", lastDischarge: "2026-01-10", location: "Accommodation" },
  { id: "5", name: "Garbage Hold #1", type: "garbage", capacity: 5000, current: 3200, unit: "kg", status: "normal", lastDischarge: "2026-01-25", location: "Main Deck" },
];

const garbageRecords: GarbageRecord[] = [
  {
    id: "GRB-2026-0128",
    date: "2026-01-28",
    time: "14:30",
    category: "Plastics",
    categoryCode: "A",
    quantity: 125,
    unit: "kg",
    method: "discharged_to_reception",
    port: "Santos, Brazil",
    receiptNumber: "PRF-BR-2026-0128",
    signedBy: "Capt. J. Anderson",
    blockchainHash: "0x8a4c...3f21"
  },
  {
    id: "GRB-2026-0125",
    date: "2026-01-25",
    time: "09:15",
    category: "Food Waste",
    categoryCode: "B",
    quantity: 85,
    unit: "kg",
    method: "discharged_at_sea",
    location: { lat: -23.9584, lng: -46.3091, distanceFromLand: 45 },
    signedBy: "Capt. J. Anderson",
    remarks: "Ground to < 25mm, discharged >12nm from nearest land",
    blockchainHash: "0x7b3d...9e45"
  },
  {
    id: "GRB-2026-0122",
    date: "2026-01-22",
    time: "16:45",
    category: "Domestic Waste",
    categoryCode: "C",
    quantity: 210,
    unit: "kg",
    method: "discharged_to_reception",
    port: "Rotterdam, Netherlands",
    receiptNumber: "PRF-NL-2026-0122",
    signedBy: "C/O M. Santos",
    blockchainHash: "0x5c2e...1a78"
  },
];

const oilRecords: OilRecord[] = [
  {
    id: "ORB-2026-0127",
    date: "2026-01-27",
    time: "10:00",
    category: "C",
    operationType: "11.1 - Discharge overboard through 15ppm equipment",
    tankId: "BHT-1",
    tankName: "Bilge Holding Tank",
    quantity: 5.5,
    retainedOnBoard: 0,
    dischargedToShore: 0,
    incineratedOrDisposed: 0,
    position: { lat: -23.9584, lng: -46.3091 },
    signedBy: "C/E L. Eriksen",
    counterSignedBy: "Capt. J. Anderson",
    blockchainHash: "0x9d4f...2b56"
  },
  {
    id: "ORB-2026-0120",
    date: "2026-01-20",
    time: "14:30",
    category: "C",
    operationType: "11.6 - Discharge to shore reception facility",
    tankId: "SLT-P",
    tankName: "Sludge Tank P",
    quantity: 8.2,
    retainedOnBoard: 0,
    dischargedToShore: 8.2,
    incineratedOrDisposed: 0,
    signedBy: "C/E L. Eriksen",
    counterSignedBy: "Capt. J. Anderson",
    blockchainHash: "0x6a1b...8c34"
  },
];

// MARPOL Categories
const marpolCategories = [
  { code: "A", name: "Plastics", color: "destructive", allowedAtSea: false, notes: "Never dischargeable at sea" },
  { code: "B", name: "Food Waste", color: "success", allowedAtSea: true, distance: ">12nm", notes: "Ground to <25mm" },
  { code: "C", name: "Domestic Waste", color: "warning", allowedAtSea: true, distance: ">12nm", notes: "Ground or compacted" },
  { code: "D", name: "Cooking Oil", color: "orange", allowedAtSea: true, distance: ">12nm", notes: "Mixed with water" },
  { code: "E", name: "Incinerator Ashes", color: "secondary", allowedAtSea: true, distance: ">12nm", notes: "Outside special areas" },
  { code: "F", name: "Operational Waste", color: "primary", allowedAtSea: false, notes: "To port reception only" },
  { code: "G", name: "Animal Carcasses", color: "muted", allowedAtSea: true, distance: "ASAP", notes: "Far from land as possible" },
  { code: "H", name: "Fishing Gear", color: "blue", allowedAtSea: false, notes: "To port reception only" },
  { code: "I", name: "E-Waste", color: "purple", allowedAtSea: false, notes: "To port reception only" },
];

// Tank visualization component
function TankVisualization({ tank }: { tank: WasteTank }) {
  const fillPercent = (tank.current / tank.capacity) * 100;
  
  const getStatusColor = () => {
    if (fillPercent >= 90) return 'bg-destructive';
    if (fillPercent >= 75) return 'bg-warning';
    return 'bg-primary';
  };
  
  const getBorderColor = () => {
    if (fillPercent >= 90) return 'border-destructive';
    if (fillPercent >= 75) return 'border-warning';
    return 'border-primary/50';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative p-4 rounded-xl border-2 ${getBorderColor()} bg-gradient-to-b from-background to-muted/30`}
    >
      {/* Tank header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {tank.type === 'sludge' && <Fuel className="h-5 w-5 text-amber-500" />}
          {tank.type === 'bilge' && <Droplets className="h-5 w-5 text-blue-500" />}
          {tank.type === 'sewage' && <Waves className="h-5 w-5 text-teal-500" />}
          {tank.type === 'garbage' && <Trash2 className="h-5 w-5 text-green-500" />}
          <span className="font-medium text-sm">{tank.name}</span>
        </div>
        <Badge variant={
          tank.status === 'critical' ? 'destructive' :
          tank.status === 'warning' ? 'secondary' : 'outline'
        }>
          {fillPercent.toFixed(0)}%
        </Badge>
      </div>
      
      {/* Tank visual */}
      <div className="relative h-32 rounded-lg border-2 border-muted bg-muted/20 overflow-hidden">
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${fillPercent}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`absolute bottom-0 left-0 right-0 ${getStatusColor()} opacity-70`}
          style={{ background: `linear-gradient(to top, hsl(var(--${tank.status === 'critical' ? 'destructive' : tank.status === 'warning' ? 'warning' : 'primary'})), transparent)` }}
        />
        
        {/* Level markers */}
        <div className="absolute inset-0 flex flex-col justify-between py-2 px-3">
          {[100, 75, 50, 25, 0].map(level => (
            <div key={level} className="flex items-center">
              <div className="w-2 h-px bg-muted-foreground/30" />
              <span className="text-[10px] text-muted-foreground ml-1">{level}%</span>
            </div>
          ))}
        </div>
        
        {/* Current level label */}
        <div className="absolute bottom-2 right-2 bg-background/90 px-2 py-1 rounded text-xs font-mono">
          {tank.current} / {tank.capacity} {tank.unit}
        </div>
      </div>
      
      {/* Tank info */}
      <div className="mt-3 text-xs text-muted-foreground space-y-1">
        <div className="flex justify-between">
          <span>Location:</span>
          <span>{tank.location}</span>
        </div>
        <div className="flex justify-between">
          <span>Last discharge:</span>
          <span>{tank.lastDischarge}</span>
        </div>
      </div>
      
      {/* Actions */}
      <div className="mt-3 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1 text-xs">
          <Plus className="h-3 w-3 mr-1" />
          Log Entry
        </Button>
        <Button variant="outline" size="sm" className="flex-1 text-xs">
          <FileText className="h-3 w-3 mr-1" />
          History
        </Button>
      </div>
    </motion.div>
  );
}

// Record card component
function GarbageRecordCard({ record }: { record: GarbageRecord }) {
  const category = marpolCategories.find(c => c.code === record.categoryCode);
  
  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl bg-${category?.color}/10`}>
              <Package className={`h-6 w-6 text-${category?.color}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold">{record.category}</h4>
                <Badge variant="outline" className="font-mono text-xs">Cat. {record.categoryCode}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {record.quantity} {record.unit} - {record.method.replace(/_/g, ' ')}
              </p>
              
              {record.port && (
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{record.port}</span>
                  {record.receiptNumber && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {record.receiptNumber}
                    </Badge>
                  )}
                </div>
              )}
              
              {record.location && (
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <Anchor className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {record.location.lat.toFixed(4)}°, {record.location.lng.toFixed(4)}° 
                    ({record.location.distanceFromLand}nm from land)
                  </span>
                </div>
              )}
              
              {record.remarks && (
                <p className="text-xs text-muted-foreground mt-2 italic">"{record.remarks}"</p>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <p className="font-mono text-sm">{record.id}</p>
            <p className="text-xs text-muted-foreground">{record.date} {record.time}</p>
            <div className="flex items-center justify-end gap-1 mt-2">
              <Lock className="h-3 w-3 text-success" />
              <span className="text-xs font-mono text-success">{record.blockchainHash}</span>
            </div>
          </div>
        </div>
        
        <Separator className="my-3" />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>Signed by: {record.signedBy}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4 mr-1" />
              PDF
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main component
export default function WasteManagementMARPOLPro() {
  const [activeTab, setActiveTab] = useState('tanks');
  const [showNewRecordDialog, setShowNewRecordDialog] = useState(false);
  
  // Stats
  const totalCapacity = wasteTanks.reduce((acc, t) => acc + (t.type !== 'garbage' ? t.capacity : 0), 0);
  const totalCurrent = wasteTanks.reduce((acc, t) => acc + (t.type !== 'garbage' ? t.current : 0), 0);
  const criticalTanks = wasteTanks.filter(t => t.status === 'critical').length;
  const warningTanks = wasteTanks.filter(t => t.status === 'warning').length;
  
  const recyclingRate = 71; // Mock calculation
  const complianceScore = 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-teal-500/20 to-green-500/20 rounded-xl">
            <Recycle className="h-8 w-8 text-teal-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              Waste Management
              <Badge className="bg-teal-500">MARPOL V/VI</Badge>
            </h2>
            <p className="text-muted-foreground">
              Electronic Garbage & Oil Record Books with blockchain audit
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Export GRB
          </Button>
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Export ORB
          </Button>
          <Button className="gap-2" onClick={() => setShowNewRecordDialog(true)}>
            <Plus className="h-4 w-4" />
            New Entry
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-teal-500/10 to-transparent border-teal-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Tank Capacity Used</p>
                <p className="text-2xl font-bold">{((totalCurrent/totalCapacity)*100).toFixed(0)}%</p>
                <Progress value={(totalCurrent/totalCapacity)*100} className="h-1.5 mt-2" />
              </div>
              <Droplets className="h-8 w-8 text-teal-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${criticalTanks > 0 ? 'from-destructive/10 border-destructive/30' : 'from-success/10 border-success/30'} to-transparent`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Critical Tanks</p>
                <p className={`text-2xl font-bold ${criticalTanks > 0 ? 'text-destructive' : 'text-success'}`}>
                  {criticalTanks}
                </p>
                <p className="text-xs text-muted-foreground">{warningTanks} warning</p>
              </div>
              <AlertTriangle className={`h-8 w-8 ${criticalTanks > 0 ? 'text-destructive' : 'text-success'}/50`} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Recycling Rate</p>
                <p className="text-2xl font-bold text-green-500">{recyclingRate}%</p>
                <div className="flex items-center gap-1 text-xs text-green-500">
                  <TrendingUp className="h-3 w-3" />
                  +5% vs last month
                </div>
              </div>
              <Recycle className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">GRB Entries (MTD)</p>
                <p className="text-2xl font-bold">{garbageRecords.length}</p>
                <p className="text-xs text-muted-foreground">All verified</p>
              </div>
              <FileText className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-transparent border-success/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">MARPOL Compliance</p>
                <p className="text-2xl font-bold text-success">{complianceScore}%</p>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-success" />
                  <span className="text-xs text-success">Fully Compliant</span>
                </div>
              </div>
              <Shield className="h-8 w-8 text-success/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="tanks" className="gap-2">
            <Droplets className="h-4 w-4" />
            Tank Status
          </TabsTrigger>
          <TabsTrigger value="grb" className="gap-2">
            <Trash2 className="h-4 w-4" />
            e-GRB
          </TabsTrigger>
          <TabsTrigger value="orb" className="gap-2">
            <Fuel className="h-4 w-4" />
            e-ORB
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <Package className="h-4 w-4" />
            MARPOL Categories
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Tank Status */}
        <TabsContent value="tanks" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {wasteTanks.map(tank => (
              <TankVisualization key={tank.id} tank={tank} />
            ))}
          </div>
          
          {/* Next discharge recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4" />
                Discharge Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {wasteTanks.filter(t => t.status !== 'normal').map(tank => (
                  <div key={tank.id} className="flex items-center justify-between p-3 rounded-lg border border-warning/30 bg-warning/5">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-warning" />
                      <div>
                        <p className="font-medium">{tank.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {((tank.current/tank.capacity)*100).toFixed(0)}% full - Schedule discharge at next port
                        </p>
                      </div>
                    </div>
                    <Button size="sm">Schedule</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* e-GRB (Electronic Garbage Record Book) */}
        <TabsContent value="grb" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Lock className="h-3 w-3" />
                Blockchain Verified
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Shield className="h-3 w-3" />
                IMO MEPC.277(70)
              </Badge>
            </div>
            <Button className="gap-2" onClick={() => setShowNewRecordDialog(true)}>
              <Plus className="h-4 w-4" />
              New GRB Entry
            </Button>
          </div>
          
          <div className="space-y-3">
            {garbageRecords.map(record => (
              <GarbageRecordCard key={record.id} record={record} />
            ))}
          </div>
        </TabsContent>

        {/* e-ORB (Electronic Oil Record Book) */}
        <TabsContent value="orb" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Lock className="h-3 w-3" />
                Blockchain Verified
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Shield className="h-3 w-3" />
                MARPOL Annex I
              </Badge>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New ORB Entry
            </Button>
          </div>
          
          <div className="space-y-3">
            {oilRecords.map(record => (
              <Card key={record.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-amber-500/10">
                        <Fuel className="h-6 w-6 text-amber-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{record.tankName}</h4>
                          <Badge variant="outline" className="font-mono text-xs">Cat. {record.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{record.operationType}</p>
                        <p className="text-sm mt-2">
                          Quantity: <span className="font-medium">{record.quantity} m³</span>
                        </p>
                        
                        {record.position && (
                          <div className="flex items-center gap-1 mt-2 text-sm">
                            <Anchor className="h-4 w-4 text-muted-foreground" />
                            <span>{record.position.lat.toFixed(4)}°, {record.position.lng.toFixed(4)}°</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-mono text-sm">{record.id}</p>
                      <p className="text-xs text-muted-foreground">{record.date} {record.time}</p>
                      <div className="flex items-center justify-end gap-1 mt-2">
                        <Lock className="h-3 w-3 text-success" />
                        <span className="text-xs font-mono text-success">{record.blockchainHash}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-3" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{record.signedBy}</span>
                      </div>
                      {record.counterSignedBy && (
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4 text-success" />
                          <span>Counter-signed: {record.counterSignedBy}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* MARPOL Categories */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                MARPOL Annex V Garbage Categories
              </CardTitle>
              <CardDescription>
                Discharge requirements as per IMO MEPC.277(70)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {marpolCategories.map(cat => (
                  <Card key={cat.code} className={`border-l-4 border-l-${cat.color}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg bg-${cat.color}/10 flex items-center justify-center font-bold text-${cat.color}`}>
                          {cat.code}
                        </div>
                        <div>
                          <h4 className="font-medium">{cat.name}</h4>
                          <Badge variant={cat.allowedAtSea ? 'default' : 'destructive'} className="text-xs mt-1">
                            {cat.allowedAtSea ? `Allowed ${cat.distance}` : 'Prohibited at sea'}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{cat.notes}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Waste Generation by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { category: "Plastics", amount: 125, color: "destructive" },
                    { category: "Food Waste", amount: 380, color: "success" },
                    { category: "Domestic Waste", amount: 210, color: "warning" },
                    { category: "Operational Waste", amount: 95, color: "primary" },
                  ].map(item => (
                    <div key={item.category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.category}</span>
                        <span className="font-medium">{item.amount} kg</span>
                      </div>
                      <Progress value={(item.amount / 400) * 100} className={`h-2`} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Disposal Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { method: "Port Reception", amount: 65, color: "success" },
                    { method: "Discharged at Sea (Legal)", amount: 25, color: "primary" },
                    { method: "Incinerated", amount: 10, color: "warning" },
                  ].map(item => (
                    <div key={item.method} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full bg-${item.color}`} />
                        <span className="text-sm">{item.method}</span>
                      </div>
                      <span className="font-medium">{item.amount}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* New Record Dialog */}
      <Dialog open={showNewRecordDialog} onOpenChange={setShowNewRecordDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Garbage Record Book Entry</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {marpolCategories.map(cat => (
                    <SelectItem key={cat.code} value={cat.code}>
                      {cat.code} - {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Quantity (kg)</label>
              <Input type="number" placeholder="0" />
            </div>
            <div>
              <label className="text-sm font-medium">Disposal Method</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reception">Discharged to Port Reception</SelectItem>
                  <SelectItem value="sea">Discharged at Sea</SelectItem>
                  <SelectItem value="incinerated">Incinerated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Port (if applicable)</label>
              <Input placeholder="Port name" />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium">Remarks</label>
              <Textarea placeholder="Additional notes..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewRecordDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              toast.success("GRB entry created and blockchain verified");
              setShowNewRecordDialog(false);
            }}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Create Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
