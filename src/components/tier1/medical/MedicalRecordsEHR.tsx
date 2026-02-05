/**
 * MedicalRecordsEHR - Electronic Health Records System
 * Benchmark: VIKAND OneHealth + Marine Doctor
 * Features: Complete EHR, ICD-10 coding, GDPR compliance, medical history
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import {
  User, Search, FileText, Heart, Pill, Syringe, 
  Calendar, Clock, AlertTriangle, Shield, Download,
  Edit, Plus, Activity, Thermometer, Eye, ChevronRight,
  Lock, CheckCircle2, XCircle, Stethoscope, ClipboardList,
  UserCheck, Droplets, Brain, Bone, HeartPulse
} from "lucide-react";

// Types
interface CrewMember {
  id: string;
  name: string;
  rank: string;
  department: string;
  photo?: string;
  dob: string;
  age: number;
  bloodType: string;
  nationality: string;
  vessel: string;
  allergies: string[];
  chronicConditions: string[];
  fitnessStatus: 'fit' | 'fit-with-restrictions' | 'unfit' | 'pending';
  lastExam: string;
  nextExam: string;
}

interface MedicalVisit {
  id: string;
  date: string;
  type: 'routine' | 'emergency' | 'follow-up' | 'telemedicine';
  complaint: string;
  diagnosis: string;
  icdCode: string;
  treatment: string;
  physician: string;
  vitals?: {
    bp: string;
    hr: number;
    temp: number;
    spo2: number;
  };
  followUp?: string;
  status: 'completed' | 'pending';
}

interface Vaccination {
  vaccine: string;
  date: string;
  expiryDate?: string;
  lotNumber: string;
  location: string;
  status: 'current' | 'expired' | 'due-soon';
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  prescribedBy: string;
  status: 'active' | 'completed' | 'discontinued';
}

// Mock data
const crewMembers: CrewMember[] = [
  {
    id: "1",
    name: "John Anderson",
    rank: "Master",
    department: "Deck",
    dob: "1978-05-15",
    age: 47,
    bloodType: "O+",
    nationality: "USA",
    vessel: "MV Atlantic Star",
    allergies: ["Penicillin"],
    chronicConditions: ["Hypertension (controlled)"],
    fitnessStatus: 'fit',
    lastExam: "2025-11-20",
    nextExam: "2026-11-20"
  },
  {
    id: "2",
    name: "Maria Santos",
    rank: "Chief Officer",
    department: "Deck",
    dob: "1985-08-22",
    age: 40,
    bloodType: "A+",
    nationality: "Brazil",
    vessel: "MV Atlantic Star",
    allergies: [],
    chronicConditions: [],
    fitnessStatus: 'fit',
    lastExam: "2025-09-15",
    nextExam: "2026-09-15"
  },
  {
    id: "3",
    name: "Lars Eriksen",
    rank: "Chief Engineer",
    department: "Engine",
    dob: "1980-02-10",
    age: 45,
    bloodType: "B-",
    nationality: "Norway",
    vessel: "MV Pacific Queen",
    allergies: ["Sulfa drugs"],
    chronicConditions: ["Mild asthma"],
    fitnessStatus: 'fit-with-restrictions',
    lastExam: "2025-10-05",
    nextExam: "2026-10-05"
  },
  {
    id: "4",
    name: "Chen Wei",
    rank: "AB Seaman",
    department: "Deck",
    dob: "1992-11-30",
    age: 33,
    bloodType: "O-",
    nationality: "China",
    vessel: "MV Atlantic Star",
    allergies: [],
    chronicConditions: [],
    fitnessStatus: 'pending',
    lastExam: "2024-12-10",
    nextExam: "2025-12-10"
  },
];

const medicalVisits: MedicalVisit[] = [
  {
    id: "1",
    date: "2026-02-01",
    type: "routine",
    complaint: "Annual physical examination",
    diagnosis: "Healthy adult - no issues",
    icdCode: "Z00.00",
    treatment: "No treatment required",
    physician: "Dr. James Wilson",
    vitals: { bp: "120/80", hr: 72, temp: 36.5, spo2: 98 },
    status: "completed"
  },
  {
    id: "2",
    date: "2026-01-15",
    type: "telemedicine",
    complaint: "Persistent headache, 3 days",
    diagnosis: "Tension headache",
    icdCode: "G44.2",
    treatment: "Paracetamol 500mg PRN, hydration, rest",
    physician: "Dr. Sarah Chen",
    vitals: { bp: "130/85", hr: 78, temp: 36.8, spo2: 99 },
    followUp: "If persists > 7 days",
    status: "completed"
  },
  {
    id: "3",
    date: "2025-12-20",
    type: "emergency",
    complaint: "Laceration right hand",
    diagnosis: "Deep laceration, 3cm",
    icdCode: "S61.0",
    treatment: "Wound cleaning, 6 sutures, tetanus booster",
    physician: "Dr. Maria Costa",
    vitals: { bp: "125/82", hr: 88, temp: 36.6, spo2: 97 },
    followUp: "Suture removal in 10 days",
    status: "completed"
  },
];

const vaccinations: Vaccination[] = [
  { vaccine: "Yellow Fever", date: "2024-03-15", lotNumber: "YF2024-A1", location: "Santos", status: "current" },
  { vaccine: "COVID-19 (Booster)", date: "2025-01-10", lotNumber: "PF-2025-01", location: "On board", status: "current" },
  { vaccine: "Hepatitis B", date: "2020-05-20", lotNumber: "HB2020-X5", location: "Houston", status: "current" },
  { vaccine: "Typhoid", date: "2023-08-01", expiryDate: "2025-08-01", lotNumber: "TY2023-B2", location: "Singapore", status: "due-soon" },
  { vaccine: "Tetanus", date: "2025-12-20", expiryDate: "2035-12-20", lotNumber: "TT2025-C3", location: "On board", status: "current" },
];

const medications: Medication[] = [
  { name: "Lisinopril", dosage: "10mg", frequency: "Once daily", startDate: "2023-01-15", prescribedBy: "Dr. Chen", status: "active" },
  { name: "Paracetamol", dosage: "500mg", frequency: "PRN (as needed)", startDate: "2026-01-15", endDate: "2026-01-22", prescribedBy: "Dr. Chen", status: "completed" },
];

// Fitness status badge
function FitnessStatusBadge({ status }: { status: CrewMember['fitnessStatus'] }) {
  const configs = {
    'fit': { color: 'bg-success text-success-foreground', icon: CheckCircle2, text: 'Fit for Duty' },
    'fit-with-restrictions': { color: 'bg-warning text-warning-foreground', icon: AlertTriangle, text: 'Fit with Restrictions' },
    'unfit': { color: 'bg-destructive text-destructive-foreground', icon: XCircle, text: 'Unfit' },
    'pending': { color: 'bg-muted text-muted-foreground', icon: Clock, text: 'Exam Pending' },
  };
  const config = configs[status];
  const Icon = config.icon;
  
  return (
    <Badge className={`${config.color} gap-1`}>
      <Icon className="h-3 w-3" />
      {config.text}
    </Badge>
  );
}

// Crew member card
function CrewMemberCard({ member, onSelect, selected }: { 
  member: CrewMember; 
  onSelect: () => void;
  selected: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border cursor-pointer transition-all ${
        selected ? 'border-primary bg-primary/5' : 'hover:border-primary/50 hover:bg-accent/30'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {member.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-medium truncate">{member.name}</h4>
            <FitnessStatusBadge status={member.fitnessStatus} />
          </div>
          <p className="text-sm text-muted-foreground">{member.rank} • {member.department}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">{member.vessel}</Badge>
            <span className="text-xs text-muted-foreground">{member.bloodType}</span>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </div>
    </motion.div>
  );
}

// Patient detail view
function PatientDetailView({ member }: { member: CrewMember }) {
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <div className="space-y-6">
      {/* Patient Header */}
      <Card className="bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
              <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
                {member.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{member.name}</h2>
                  <p className="text-muted-foreground">{member.rank} • {member.department}</p>
                </div>
                <div className="flex items-center gap-2">
                  <FitnessStatusBadge status={member.fitnessStatus} />
                  <Button variant="outline" size="sm" className="gap-1">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                  <Button size="sm" className="gap-1">
                    <Plus className="h-4 w-4" />
                    New Visit
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4 mt-4">
                <div>
                  <p className="text-xs text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{member.dob} ({member.age} years)</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Blood Type</p>
                  <p className="font-medium">{member.bloodType}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Nationality</p>
                  <p className="font-medium">{member.nationality}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Vessel</p>
                  <p className="font-medium">{member.vessel}</p>
                </div>
              </div>
              
              {/* Alerts */}
              {(member.allergies.length > 0 || member.chronicConditions.length > 0) && (
                <div className="flex gap-4 mt-4">
                  {member.allergies.length > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-destructive/10 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <span className="text-sm text-destructive font-medium">
                        Allergies: {member.allergies.join(', ')}
                      </span>
                    </div>
                  )}
                  {member.chronicConditions.length > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-warning/10 rounded-lg">
                      <Activity className="h-4 w-4 text-warning" />
                      <span className="text-sm text-warning font-medium">
                        {member.chronicConditions.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="gap-1">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="visits" className="gap-1">
            <ClipboardList className="h-4 w-4" />
            Visits
          </TabsTrigger>
          <TabsTrigger value="vaccinations" className="gap-1">
            <Syringe className="h-4 w-4" />
            Vaccines
          </TabsTrigger>
          <TabsTrigger value="medications" className="gap-1">
            <Pill className="h-4 w-4" />
            Medications
          </TabsTrigger>
          <TabsTrigger value="certificates" className="gap-1">
            <FileText className="h-4 w-4" />
            Certificates
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1">
            <Heart className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Medical Certificate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Last Exam</span>
                    <span className="text-sm font-medium">{member.lastExam}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Next Exam</span>
                    <span className="text-sm font-medium">{member.nextExam}</span>
                  </div>
                  <Progress value={75} className="mt-2" />
                  <p className="text-xs text-muted-foreground">9 months remaining</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Syringe className="h-4 w-4 text-success" />
                  Vaccination Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Up to date</span>
                    <Badge className="bg-success">4/5</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-warning">Due soon</span>
                    <Badge variant="outline" className="border-warning text-warning">1</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Pill className="h-4 w-4 text-purple-500" />
                  Active Medications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {medications.filter(m => m.status === 'active').map((med, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-sm">{med.name}</span>
                      <Badge variant="outline">{med.dosage}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Visits */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" />
                  Recent Medical Visits
                </span>
                <Button variant="ghost" size="sm">View All</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {medicalVisits.slice(0, 3).map((visit) => (
                  <div key={visit.id} className="flex items-start gap-4 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                    <div className={`p-2 rounded-lg ${
                      visit.type === 'emergency' ? 'bg-destructive/10' :
                      visit.type === 'telemedicine' ? 'bg-primary/10' :
                      'bg-success/10'
                    }`}>
                      {visit.type === 'emergency' ? <AlertTriangle className="h-5 w-5 text-destructive" /> :
                       visit.type === 'telemedicine' ? <Activity className="h-5 w-5 text-primary" /> :
                       <Stethoscope className="h-5 w-5 text-success" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{visit.diagnosis}</h4>
                        <Badge variant="outline" className="text-xs">{visit.icdCode}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{visit.complaint}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{visit.date}</span>
                        <span>•</span>
                        <span>{visit.physician}</span>
                        <span>•</span>
                        <Badge variant="secondary" className="text-xs capitalize">{visit.type}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Visits Tab */}
        <TabsContent value="visits" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="outline" size="sm">All</Button>
              <Button variant="ghost" size="sm">Routine</Button>
              <Button variant="ghost" size="sm">Emergency</Button>
              <Button variant="ghost" size="sm">Telemedicine</Button>
            </div>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              New Visit
            </Button>
          </div>
          
          <div className="space-y-3">
            {medicalVisits.map((visit) => (
              <Card key={visit.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${
                      visit.type === 'emergency' ? 'bg-destructive/10' :
                      visit.type === 'telemedicine' ? 'bg-primary/10' :
                      visit.type === 'follow-up' ? 'bg-warning/10' :
                      'bg-success/10'
                    }`}>
                      {visit.type === 'emergency' ? <AlertTriangle className="h-6 w-6 text-destructive" /> :
                       visit.type === 'telemedicine' ? <Activity className="h-6 w-6 text-primary" /> :
                       visit.type === 'follow-up' ? <Clock className="h-6 w-6 text-warning" /> :
                       <Stethoscope className="h-6 w-6 text-success" />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-lg">{visit.diagnosis}</h4>
                          <p className="text-muted-foreground">{visit.complaint}</p>
                        </div>
                        <Badge variant="outline" className="font-mono">{visit.icdCode}</Badge>
                      </div>
                      
                      <Separator className="my-3" />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Treatment</p>
                          <p className="text-sm">{visit.treatment}</p>
                        </div>
                        {visit.vitals && (
                          <div className="flex gap-4">
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">BP</p>
                              <p className="text-sm font-medium">{visit.vitals.bp}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">HR</p>
                              <p className="text-sm font-medium">{visit.vitals.hr}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">Temp</p>
                              <p className="text-sm font-medium">{visit.vitals.temp}°C</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">SpO2</p>
                              <p className="text-sm font-medium">{visit.vitals.spo2}%</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {visit.followUp && (
                        <div className="mt-3 p-2 bg-warning/10 rounded-lg">
                          <p className="text-sm text-warning flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Follow-up: {visit.followUp}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {visit.date}
                          <span>•</span>
                          <User className="h-4 w-4" />
                          {visit.physician}
                        </div>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Download className="h-4 w-4" />
                          Download PDF
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Vaccinations */}
        <TabsContent value="vaccinations" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <Card className="bg-success/10 border-success/30 px-4 py-2">
                <p className="text-xs text-success">Current</p>
                <p className="text-2xl font-bold text-success">{vaccinations.filter(v => v.status === 'current').length}</p>
              </Card>
              <Card className="bg-warning/10 border-warning/30 px-4 py-2">
                <p className="text-xs text-warning">Due Soon</p>
                <p className="text-2xl font-bold text-warning">{vaccinations.filter(v => v.status === 'due-soon').length}</p>
              </Card>
              <Card className="bg-destructive/10 border-destructive/30 px-4 py-2">
                <p className="text-xs text-destructive">Expired</p>
                <p className="text-2xl font-bold text-destructive">{vaccinations.filter(v => v.status === 'expired').length}</p>
              </Card>
            </div>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              Add Vaccination
            </Button>
          </div>
          
          <div className="grid gap-3">
            {vaccinations.map((vax, i) => (
              <Card key={i} className={`${
                vax.status === 'expired' ? 'border-destructive/50' :
                vax.status === 'due-soon' ? 'border-warning/50' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${
                        vax.status === 'current' ? 'bg-success/10' :
                        vax.status === 'due-soon' ? 'bg-warning/10' :
                        'bg-destructive/10'
                      }`}>
                        <Syringe className={`h-5 w-5 ${
                          vax.status === 'current' ? 'text-success' :
                          vax.status === 'due-soon' ? 'text-warning' :
                          'text-destructive'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-medium">{vax.vaccine}</h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>Given: {vax.date}</span>
                          {vax.expiryDate && <span>• Expires: {vax.expiryDate}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        vax.status === 'current' ? 'default' :
                        vax.status === 'due-soon' ? 'secondary' : 'destructive'
                      } className={vax.status === 'current' ? 'bg-success' : ''}>
                        {vax.status === 'current' ? 'Current' :
                         vax.status === 'due-soon' ? 'Due Soon' : 'Expired'}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">Lot: {vax.lotNumber}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Medications */}
        <TabsContent value="medications" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              Add Medication
            </Button>
          </div>
          
          <div className="grid gap-3">
            {medications.map((med, i) => (
              <Card key={i} className={med.status === 'active' ? 'border-primary/50' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${
                        med.status === 'active' ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        <Pill className={`h-5 w-5 ${
                          med.status === 'active' ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-medium">{med.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {med.dosage} • {med.frequency}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={med.status === 'active' ? 'default' : 'secondary'}>
                        {med.status === 'active' ? 'Active' : 'Completed'}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Prescribed by {med.prescribedBy}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Certificates */}
        <TabsContent value="certificates">
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <h4 className="font-medium">Medical Certificates</h4>
              <p className="text-sm text-muted-foreground">MLC 2006 fitness certificates and medical documents</p>
              <Button className="mt-4">View Certificates</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medical History */}
        <TabsContent value="history">
          <div className="grid grid-cols-2 gap-4">
            {[
              { title: "Past Illnesses", icon: Activity, items: ["Influenza (2023)", "Dengue fever (2019)"] },
              { title: "Surgeries", icon: Stethoscope, items: ["Appendectomy (2015)"] },
              { title: "Hospitalizations", icon: Heart, items: ["None recorded"] },
              { title: "Family History", icon: User, items: ["Hypertension (Father)", "Diabetes (Mother)"] },
            ].map((section, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <section.icon className="h-4 w-4" />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {section.items.map((item, j) => (
                      <li key={j} className="text-sm text-muted-foreground">• {item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Main component
export default function MedicalRecordsEHR() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<CrewMember | null>(null);
  
  const filteredCrew = crewMembers.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.rank.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.vessel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Electronic Health Records
          </h2>
          <p className="text-muted-foreground">
            GDPR compliant medical records management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Lock className="h-3 w-3" />
            Encrypted
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Shield className="h-3 w-3" />
            GDPR Compliant
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Crew List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Crew Members</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search crew..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-2">
                {filteredCrew.map((member) => (
                  <CrewMemberCard
                    key={member.id}
                    member={member}
                    onSelect={() => setSelectedMember(member)}
                    selected={selectedMember?.id === member.id}
                  />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Patient Detail */}
        <div className="lg:col-span-2">
          {selectedMember ? (
            <PatientDetailView member={selectedMember} />
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-20">
                <User className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium">Select a Crew Member</h3>
                <p className="text-muted-foreground">
                  Choose a crew member from the list to view their medical records
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
