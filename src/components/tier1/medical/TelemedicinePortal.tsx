/**
 * TelemedicinePortal - Portal Premium de Telemedicina 24/7
 * Benchmark: VIKAND OneHealth + Marine Doctor (M Doc)
 * Features: Video consultation, vital signs transmission, prescription, mental health
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone, Video, PhoneOff, Mic, MicOff, Camera, CameraOff,
  MessageSquare, FileText, Clock, User, Stethoscope, 
  Calendar, ArrowRight, CheckCircle2, AlertTriangle,
  Heart, Activity, Thermometer, Brain, Pill, ClipboardList,
  Download, Send, Star, Zap, Globe, Shield, Wifi, WifiOff,
  HeartPulse, Syringe, AlertCircle, TrendingUp, Users
} from "lucide-react";
import { toast } from "sonner";

// Types
interface Physician {
  id: string;
  name: string;
  specialty: string;
  subSpecialty?: string;
  available: boolean;
  rating: number;
  experience: string;
  languages: string[];
  certifications: string[];
  responseTime: string;
  consultations: number;
  photo?: string;
}

interface VitalSigns {
  temperature: number;
  bloodPressure: { systolic: number; diastolic: number };
  heartRate: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  glucoseLevel?: number;
}

interface PreConsultationForm {
  symptoms: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  duration: string;
  allergies: string;
  currentMedications: string;
  vitalSigns?: VitalSigns;
  photos?: string[];
  urgency: 'routine' | 'urgent' | 'emergency';
}

// Mock data - Physicians available 24/7
const physicians: Physician[] = [
  { 
    id: "1", 
    name: "Dr. James Wilson", 
    specialty: "Emergency Medicine", 
    subSpecialty: "Maritime Health",
    available: true, 
    rating: 4.9, 
    experience: "18 years", 
    languages: ["EN", "ES", "PT"],
    certifications: ["ACLS", "ATLS", "Maritime Medicine"],
    responseTime: "< 2 min",
    consultations: 3420
  },
  { 
    id: "2", 
    name: "Dr. Sarah Chen", 
    specialty: "Cardiology", 
    available: true, 
    rating: 4.8, 
    experience: "15 years", 
    languages: ["EN", "ZH", "JA"],
    certifications: ["Board Certified", "Telemedicine"],
    responseTime: "< 5 min",
    consultations: 2180
  },
  { 
    id: "3", 
    name: "Dr. Lars Eriksen", 
    specialty: "Orthopedics", 
    subSpecialty: "Sports Medicine",
    available: true, 
    rating: 4.7, 
    experience: "12 years", 
    languages: ["EN", "NO", "DE"],
    certifications: ["Orthopedic Surgery", "Sports Medicine"],
    responseTime: "< 10 min",
    consultations: 1850
  },
  { 
    id: "4", 
    name: "Dr. Maria Santos", 
    specialty: "Psychiatry", 
    subSpecialty: "Mental Health",
    available: true, 
    rating: 4.9, 
    experience: "10 years", 
    languages: ["EN", "PT", "ES"],
    certifications: ["Psychiatry", "Crisis Intervention"],
    responseTime: "< 3 min",
    consultations: 2560
  },
  { 
    id: "5", 
    name: "Dr. Ahmed Hassan", 
    specialty: "General Medicine", 
    subSpecialty: "Tropical Medicine",
    available: false, 
    rating: 4.6, 
    experience: "20 years", 
    languages: ["EN", "AR", "FR"],
    certifications: ["Tropical Medicine", "Infectious Disease"],
    responseTime: "< 5 min",
    consultations: 4200
  },
];

// Specialty icons
const specialtyIcons: Record<string, React.ReactNode> = {
  "Emergency Medicine": <AlertCircle className="h-5 w-5 text-destructive" />,
  "Cardiology": <HeartPulse className="h-5 w-5 text-red-500" />,
  "Orthopedics": <Activity className="h-5 w-5 text-blue-500" />,
  "Psychiatry": <Brain className="h-5 w-5 text-purple-500" />,
  "General Medicine": <Stethoscope className="h-5 w-5 text-green-500" />,
};

// Connection quality component
function ConnectionQuality({ quality }: { quality: 'excellent' | 'good' | 'fair' | 'poor' }) {
  const colors = {
    excellent: 'bg-success text-success',
    good: 'bg-primary text-primary',
    fair: 'bg-warning text-warning',
    poor: 'bg-destructive text-destructive'
  };
  
  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full bg-background/80 backdrop-blur ${colors[quality].split(' ')[1]}`}>
      {quality === 'poor' ? <WifiOff className="h-3 w-3" /> : <Wifi className="h-3 w-3" />}
      <span className="text-xs font-medium capitalize">{quality}</span>
    </div>
  );
}

// Pre-consultation form
function PreConsultationFormComponent({ onSubmit }: { onSubmit: (data: PreConsultationForm) => void }) {
  const [form, setForm] = useState<PreConsultationForm>({
    symptoms: '',
    severity: 'medium',
    duration: '',
    allergies: '',
    currentMedications: '',
    urgency: 'routine'
  });
  
  const [vitals, setVitals] = useState<VitalSigns>({
    temperature: 36.5,
    bloodPressure: { systolic: 120, diastolic: 80 },
    heartRate: 72,
    respiratoryRate: 16,
    oxygenSaturation: 98
  });
  
  const [showVitals, setShowVitals] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="text-sm font-medium mb-1.5 block">Chief Complaint / Symptoms *</label>
          <Textarea 
            placeholder="Describe your symptoms in detail..."
            value={form.symptoms}
            onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
            className="min-h-[100px]"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1.5 block">Severity *</label>
          <Select 
            value={form.severity} 
            onValueChange={(v) => setForm({ ...form, severity: v as PreConsultationForm["severity"] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  Low - Minor discomfort
                </span>
              </SelectItem>
              <SelectItem value="medium">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-warning" />
                  Medium - Moderate symptoms
                </span>
              </SelectItem>
              <SelectItem value="high">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  High - Severe symptoms
                </span>
              </SelectItem>
              <SelectItem value="critical">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-destructive" />
                  Critical - Life-threatening
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1.5 block">Urgency *</label>
          <Select 
            value={form.urgency} 
            onValueChange={(v) => setForm({ ...form, urgency: v as PreConsultationForm["urgency"] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="routine">Routine (can wait 24h)</SelectItem>
              <SelectItem value="urgent">Urgent (within 2h)</SelectItem>
              <SelectItem value="emergency">Emergency (immediate)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1.5 block">Duration of Symptoms</label>
          <Input 
            placeholder="e.g., 2 days"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1.5 block">Known Allergies</label>
          <Input 
            placeholder="e.g., Penicillin, shellfish"
            value={form.allergies}
            onChange={(e) => setForm({ ...form, allergies: e.target.value })}
          />
        </div>
        
        <div className="col-span-2">
          <label className="text-sm font-medium mb-1.5 block">Current Medications</label>
          <Input 
            placeholder="List any medications you're currently taking"
            value={form.currentMedications}
            onChange={(e) => setForm({ ...form, currentMedications: e.target.value })}
          />
        </div>
      </div>
      
      {/* Vital Signs Section */}
      <Card className="border-dashed">
        <CardHeader className="py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-destructive" />
              Vital Signs (Optional)
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowVitals(!showVitals)}
            >
              {showVitals ? 'Hide' : 'Add Vitals'}
            </Button>
          </div>
        </CardHeader>
        <AnimatePresence>
          {showVitals && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <CardContent className="pt-0">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground">Temperature (°C)</label>
                    <Input 
                      type="number" 
                      step="0.1"
                      value={vitals.temperature}
                      onChange={(e) => setVitals({ ...vitals, temperature: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">BP Systolic</label>
                    <Input 
                      type="number"
                      value={vitals.bloodPressure.systolic}
                      onChange={(e) => setVitals({ 
                        ...vitals, 
                        bloodPressure: { ...vitals.bloodPressure, systolic: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">BP Diastolic</label>
                    <Input 
                      type="number"
                      value={vitals.bloodPressure.diastolic}
                      onChange={(e) => setVitals({ 
                        ...vitals, 
                        bloodPressure: { ...vitals.bloodPressure, diastolic: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Heart Rate (bpm)</label>
                    <Input 
                      type="number"
                      value={vitals.heartRate}
                      onChange={(e) => setVitals({ ...vitals, heartRate: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">SpO2 (%)</label>
                    <Input 
                      type="number"
                      value={vitals.oxygenSaturation}
                      onChange={(e) => setVitals({ ...vitals, oxygenSaturation: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Resp Rate (/min)</label>
                    <Input 
                      type="number"
                      value={vitals.respiratoryRate}
                      onChange={(e) => setVitals({ ...vitals, respiratoryRate: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
      
      <Button 
        className="w-full gap-2"
        size="lg"
        onClick={() => onSubmit({ ...form, vitalSigns: showVitals ? vitals : undefined })}
        disabled={!form.symptoms}
      >
        <Video className="h-5 w-5" />
        Request Consultation
      </Button>
    </div>
  );
}

// Physician card
function PhysicianCard({ physician, onSelect, selected }: { 
  physician: Physician; 
  onSelect: () => void; 
  selected: boolean 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
        physician.available 
          ? selected 
            ? "border-primary bg-primary/5" 
            : "hover:border-primary/50 hover:bg-accent/50" 
          : "opacity-50 cursor-not-allowed border-muted"
      }`}
      onClick={physician.available ? onSelect : undefined}
    >
      <div className="flex items-start gap-4">
        <Avatar className="h-14 w-14 border-2 border-background shadow-lg">
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-bold text-lg">
            {physician.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold truncate">{physician.name}</h4>
            <Badge variant={physician.available ? "default" : "secondary"} className="ml-2">
              {physician.available ? (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-pulse" />
                  Online
                </>
              ) : "Offline"}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            {specialtyIcons[physician.specialty]}
            <span className="text-sm text-muted-foreground">{physician.specialty}</span>
            {physician.subSpecialty && (
              <span className="text-xs text-muted-foreground">• {physician.subSpecialty}</span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-warning text-warning" />
              {physician.rating}
            </div>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">{physician.experience}</span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">{physician.consultations.toLocaleString()} consults</span>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {physician.languages.map(lang => (
              <Badge key={lang} variant="outline" className="text-xs">
                {lang}
              </Badge>
            ))}
          </div>
          
          {physician.available && (
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="secondary" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Response: {physician.responseTime}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Video call interface
function VideoCallInterface({ 
  physician, 
  onEnd,
  vitalSigns 
}: { 
  physician: Physician; 
  onEnd: () => void;
  vitalSigns?: VitalSigns;
}) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [duration, setDuration] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; message: string; time: string }>>([
    { sender: 'system', message: 'Connection established. Video consultation started.', time: 'now' }
  ]);
  const [newMessage, setNewMessage] = useState('');

  React.useEffect(() => {
    const interval = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    setChatMessages([...chatMessages, { sender: 'you', message: newMessage, time: 'now' }]);
    setNewMessage('');
    // Immediate response (no artificial delay)
    setChatMessages(prev => [...prev, { sender: 'doctor', message: 'I understand. Let me check your symptoms.', time: 'now' }]);
  };

  return (
    <div className="space-y-4">
      {/* Main Video Area */}
      <div className="relative aspect-video bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden shadow-2xl">
        {/* Doctor Video */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <Avatar className="h-32 w-32 mx-auto border-4 border-white/20 shadow-2xl">
              <AvatarFallback className="text-4xl bg-gradient-to-br from-primary/30 to-primary/10 text-white">
                {physician.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <p className="text-white font-semibold mt-4 text-xl">{physician.name}</p>
            <p className="text-white/70">{physician.specialty}</p>
            <Badge className="mt-3 bg-success/80">
              <Activity className="h-3 w-3 mr-1 animate-pulse" />
              In Consultation
            </Badge>
          </motion.div>
        </div>

        {/* Self Video (PIP) */}
        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="absolute bottom-4 right-4 w-40 h-28 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl border-2 border-white/20 overflow-hidden shadow-xl"
        >
          {isVideoOff ? (
            <div className="w-full h-full flex items-center justify-center">
              <CameraOff className="h-8 w-8 text-white/50" />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/30 to-primary/10">
              <User className="h-10 w-10 text-white/70" />
            </div>
          )}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
            <Badge variant="secondary" className="text-xs">You</Badge>
          </div>
        </motion.div>

        {/* Top Bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-black/50 backdrop-blur rounded-full flex items-center gap-2">
              <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
              <span className="text-white font-mono">{formatDuration(duration)}</span>
            </div>
            <Badge variant="secondary" className="bg-black/50 backdrop-blur text-white">
              <Globe className="h-3 w-3 mr-1" />
              Encrypted
            </Badge>
          </div>
          <ConnectionQuality quality="excellent" />
        </div>

        {/* Chat Overlay */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="absolute top-16 right-4 bottom-36 w-72 bg-black/70 backdrop-blur rounded-xl border border-white/10 flex flex-col"
            >
              <div className="p-3 border-b border-white/10">
                <h4 className="text-white text-sm font-medium">Chat</h4>
              </div>
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-3">
                  {chatMessages.map((msg, i) => (
                    <div key={`chat-msg-${i}-${msg.sender}`} className={`text-sm ${msg.sender === 'you' ? 'text-right' : ''}`}>
                      <span className={`inline-block px-3 py-2 rounded-lg max-w-[90%] ${
                        msg.sender === 'you' 
                          ? 'bg-primary text-primary-foreground' 
                          : msg.sender === 'system'
                          ? 'bg-muted text-muted-foreground text-xs'
                          : 'bg-white/10 text-white'
                      }`}>
                        {msg.message}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-3 border-t border-white/10">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                  <Button size="icon" onClick={sendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Vital Signs Display */}
      {vitalSigns && (
        <div className="grid grid-cols-6 gap-2">
          <Card className="bg-gradient-to-br from-destructive/10 to-transparent border-destructive/20">
            <CardContent className="p-3 text-center">
              <Thermometer className="h-4 w-4 mx-auto text-destructive mb-1" />
              <p className="text-lg font-bold">{vitalSigns.temperature}°C</p>
              <p className="text-[10px] text-muted-foreground">Temp</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-destructive/10 to-transparent border-destructive/20">
            <CardContent className="p-3 text-center">
              <HeartPulse className="h-4 w-4 mx-auto text-destructive mb-1" />
              <p className="text-lg font-bold">{vitalSigns.bloodPressure.systolic}/{vitalSigns.bloodPressure.diastolic}</p>
              <p className="text-[10px] text-muted-foreground">BP</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-accent/10 to-transparent border-accent/20">
            <CardContent className="p-3 text-center">
              <Heart className="h-4 w-4 mx-auto text-accent-foreground mb-1" />
              <p className="text-lg font-bold">{vitalSigns.heartRate}</p>
              <p className="text-[10px] text-muted-foreground">HR bpm</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-info/10 to-transparent border-info/20">
            <CardContent className="p-3 text-center">
              <Activity className="h-4 w-4 mx-auto text-info mb-1" />
              <p className="text-lg font-bold">{vitalSigns.oxygenSaturation}%</p>
              <p className="text-[10px] text-muted-foreground">SpO2</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
            <CardContent className="p-3 text-center">
              <Activity className="h-4 w-4 mx-auto text-primary mb-1" />
              <p className="text-lg font-bold">{vitalSigns.respiratoryRate}</p>
              <p className="text-[10px] text-muted-foreground">RR/min</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-success/10 to-transparent border-success/20">
            <CardContent className="p-3 text-center">
              <CheckCircle2 className="h-4 w-4 mx-auto text-success mb-1" />
              <p className="text-lg font-bold">Normal</p>
              <p className="text-[10px] text-muted-foreground">Status</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant={isMuted ? "destructive" : "outline"}
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg"
          onClick={() => setIsMuted(!isMuted)}
        >
          {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </Button>
        
        <Button
          variant={isVideoOff ? "destructive" : "outline"}
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg"
          onClick={() => setIsVideoOff(!isVideoOff)}
        >
          {isVideoOff ? <CameraOff className="h-6 w-6" /> : <Camera className="h-6 w-6" />}
        </Button>
        
        <Button
          variant="destructive"
          size="icon"
          className="h-16 w-16 rounded-full shadow-xl"
          onClick={onEnd}
        >
          <PhoneOff className="h-7 w-7" />
        </Button>
        
        <Button
          variant={showChat ? "default" : "outline"}
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg"
          onClick={() => setShowChat(!showChat)}
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg"
        >
          <FileText className="h-6 w-6" />
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-5 gap-2">
        <Button variant="outline" className="flex-col h-auto py-3 gap-1">
          <Heart className="h-5 w-5 text-destructive" />
          <span className="text-xs">Vitals</span>
        </Button>
        <Button variant="outline" className="flex-col h-auto py-3 gap-1">
          <Pill className="h-5 w-5 text-primary" />
          <span className="text-xs">Prescription</span>
        </Button>
        <Button variant="outline" className="flex-col h-auto py-3 gap-1">
          <ClipboardList className="h-5 w-5 text-warning" />
          <span className="text-xs">History</span>
        </Button>
        <Button variant="outline" className="flex-col h-auto py-3 gap-1">
          <Syringe className="h-5 w-5 text-purple-500" />
          <span className="text-xs">Vaccines</span>
        </Button>
        <Button variant="outline" className="flex-col h-auto py-3 gap-1">
          <Download className="h-5 w-5 text-success" />
          <span className="text-xs">Records</span>
        </Button>
      </div>
    </div>
  );
}

// Main component
export default function TelemedicinePortal() {
  const [step, setStep] = useState<'select' | 'form' | 'connecting' | 'call'>('select');
  const [selectedPhysician, setSelectedPhysician] = useState<Physician | null>(null);
  const [preConsultData, setPreConsultData] = useState<PreConsultationForm | null>(null);
  const [activeTab, setActiveTab] = useState('available');

  const handlePhysicianSelect = (physician: Physician) => {
    setSelectedPhysician(physician);
    setStep('form');
  };

  const handleFormSubmit = (data: PreConsultationForm) => {
    setPreConsultData(data);
    setStep('connecting');
    toast.loading(`Connecting to ${selectedPhysician?.name}...`);
    
    // Transition immediately (no artificial delay)
    setStep('call');
    toast.success('Consultation started!');
  };

  const handleEndCall = () => {
    setStep('select');
    setSelectedPhysician(null);
    setPreConsultData(null);
    toast.info('Consultation ended. Summary will be sent via email.');
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-success/10 to-transparent border-success/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Physicians Online</p>
                <p className="text-3xl font-bold text-success">
                  {physicians.filter(p => p.available).length}
                </p>
                <p className="text-xs text-success">24/7 Available</p>
              </div>
              <div className="p-3 bg-success/20 rounded-xl">
                <Stethoscope className="h-8 w-8 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">This Month</p>
                <p className="text-3xl font-bold">18</p>
                <p className="text-xs text-muted-foreground">Consultations</p>
              </div>
              <div className="p-3 bg-primary/20 rounded-xl">
                <Video className="h-8 w-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-transparent border-warning/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Avg Response</p>
                <p className="text-3xl font-bold text-warning">2.5m</p>
                <p className="text-xs text-warning">Very Fast</p>
              </div>
              <div className="p-3 bg-warning/20 rounded-xl">
                <Zap className="h-8 w-8 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Satisfaction</p>
                <p className="text-3xl font-bold text-purple-500">98%</p>
                <div className="flex gap-0.5 mt-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={`star-rating-${i}`} className="h-3 w-3 fill-warning text-warning" />
                  ))}
                </div>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {step === 'call' && selectedPhysician ? (
          <motion.div
            key="call"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <VideoCallInterface 
              physician={selectedPhysician} 
              onEnd={handleEndCall}
              vitalSigns={preConsultData?.vitalSigns}
            />
          </motion.div>
        ) : step === 'connecting' ? (
          <motion.div
            key="connecting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="py-20">
              <CardContent className="text-center">
                <div className="relative inline-block">
                  <Avatar className="h-24 w-24 border-4 border-primary animate-pulse">
                    <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                      {selectedPhysician?.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 p-2 bg-success rounded-full animate-bounce">
                    <Phone className="h-4 w-4 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mt-6">Connecting to {selectedPhysician?.name}...</h3>
                <p className="text-muted-foreground mt-2">{selectedPhysician?.specialty}</p>
                <Progress className="w-48 mx-auto mt-6" value={66} />
                <p className="text-sm text-muted-foreground mt-4">Establishing secure connection...</p>
              </CardContent>
            </Card>
          </motion.div>
        ) : step === 'form' && selectedPhysician ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {selectedPhysician.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>Pre-Consultation Form</CardTitle>
                      <CardDescription>
                        Preparing consultation with {selectedPhysician.name}
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" onClick={() => setStep('select')}>
                    Change Physician
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <PreConsultationFormComponent onSubmit={handleFormSubmit} />
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="h-5 w-5 text-primary" />
                      Telemedicine 24/7
                    </CardTitle>
                    <CardDescription>
                      Connect with qualified physicians anytime, anywhere
                    </CardDescription>
                  </div>
                  <Button variant="outline" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    Schedule Later
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="available">Available Now</TabsTrigger>
                    <TabsTrigger value="specialists">Specialists</TabsTrigger>
                    <TabsTrigger value="mental">Mental Health</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="available">
                    <ScrollArea className="h-[500px] pr-4">
                      <div className="grid gap-4">
                        {physicians.filter(p => p.available).map((physician) => (
                          <PhysicianCard
                            key={physician.id}
                            physician={physician}
                            onSelect={() => handlePhysicianSelect(physician)}
                            selected={selectedPhysician?.id === physician.id}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="specialists">
                    <ScrollArea className="h-[500px] pr-4">
                      <div className="grid gap-4">
                        {physicians.filter(p => p.specialty !== 'General Medicine').map((physician) => (
                          <PhysicianCard
                            key={physician.id}
                            physician={physician}
                            onSelect={() => handlePhysicianSelect(physician)}
                            selected={selectedPhysician?.id === physician.id}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="mental">
                    <ScrollArea className="h-[500px] pr-4">
                      <div className="grid gap-4">
                        {physicians.filter(p => p.specialty === 'Psychiatry').map((physician) => (
                          <PhysicianCard
                            key={physician.id}
                            physician={physician}
                            onSelect={() => handlePhysicianSelect(physician)}
                            selected={selectedPhysician?.id === physician.id}
                          />
                        ))}
                        <Card className="border-dashed bg-muted/30">
                          <CardContent className="p-6 text-center">
                            <Brain className="h-12 w-12 mx-auto text-purple-500/50 mb-3" />
                            <h4 className="font-medium">24/7 Crisis Support</h4>
                            <p className="text-sm text-muted-foreground mt-1 mb-4">
                              Confidential mental health support available anytime
                            </p>
                            <Button variant="outline" className="gap-2">
                              <Phone className="h-4 w-4" />
                              Crisis Hotline
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
