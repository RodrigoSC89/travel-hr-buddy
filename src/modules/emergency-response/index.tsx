/**
 * Emergency Response Module - PATCH 69.0
 * SAR coordination, evacuation planning, and AI-driven response
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Radio, Users, MapPin, Clock, Brain, Phone, FileText } from "lucide-react";
import { toast } from "sonner";
import { Logger } from "@/lib/utils/logger";

type EmergencyType = "sar" | "fire" | "medical" | "abandon_ship" | "pollution" | "collision";
type EmergencySeverity = "low" | "medium" | "high" | "critical";

interface EmergencyIncident {
  id: string;
  type: EmergencyType;
  severity: EmergencySeverity;
  title: string;
  location: string;
  timestamp: string;
  status: "active" | "responding" | "resolved";
  personnel: number;
  aiRecommendation?: string;
}

interface EvacuationPlan {
  vesselName: string;
  totalPersonnel: number;
  musterStations: string[];
  lifeboats: number;
  estimatedTime: number;
}

const EmergencyResponse = () => {
  const [incidents, setIncidents] = useState<EmergencyIncident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<EmergencyIncident | null>(null);
  const [emergencyType, setEmergencyType] = useState<EmergencyType>("sar");
  const [description, setDescription] = useState("");
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  useEffect(() => {
    Logger.module("emergency-response", "Initializing Emergency Response PATCH 69.0");
    loadMockIncidents();
  }, []);

  const loadMockIncidents = () => {
    const mockIncidents: EmergencyIncident[] = [
      {
        id: "1",
        type: "sar",
        severity: "critical",
        title: "Man Overboard - SAR Operation",
        location: "23°45'N 45°12'W",
        timestamp: new Date().toISOString(),
        status: "active",
        personnel: 1,
      },
      {
        id: "2",
        type: "fire",
        severity: "high",
        title: "Engine Room Fire Alert",
        location: "Engine Room - Deck 3",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: "responding",
        personnel: 8,
      },
    ];
    setIncidents(mockIncidents);
  };

  const handleAIAnalysis = async () => {
    if (!selectedIncident) return;

    setAiAnalyzing(true);
    toast.info("AI analyzing emergency situation...");

    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const recommendations = getAIRecommendations(selectedIncident.type, selectedIncident.severity);
      
      setSelectedIncident({
        ...selectedIncident,
        aiRecommendation: recommendations
      });

      toast.success("AI analysis completed");
      Logger.ai("Emergency analysis completed", { 
        incidentId: selectedIncident.id, 
        type: selectedIncident.type 
      });
    } catch (error) {
      Logger.error("AI analysis failed", error, "emergency-response");
      toast.error("Analysis failed");
    } finally {
      setAiAnalyzing(false);
    }
  };

  const getAIRecommendations = (type: EmergencyType, severity: EmergencySeverity): string => {
    const recommendations: Record<EmergencyType, string> = {
      sar: `IMMEDIATE ACTIONS:
1. Sound general alarm - 7 short + 1 long blast
2. Deploy MOB marker and life ring
3. Maintain visual contact with person
4. Execute Williamson Turn maneuver
5. Alert Coast Guard on VHF Ch 16
6. Deploy rescue boat with 4-person crew
7. Medical team on standby
8. Document incident per ISM Code Section 9`,

      fire: `FIRE RESPONSE PROTOCOL:
1. Sound fire alarm - continuous bell
2. Activate fixed fire suppression system
3. Muster fire team at Station Alpha
4. Evacuate non-essential personnel
5. Close all fire doors and ventilation
6. Prepare for CO2 release if needed
7. Medical team ready for burn treatment
8. Document per SOLAS Chapter II-2`,

      medical: `MEDICAL EMERGENCY PROTOCOL:
1. Alert medical officer immediately
2. Prepare medical bay
3. Assess patient vitals and condition
4. Contact telemedicine support
5. Prepare for medevac if critical
6. Document all interventions
7. Alert next of kin if severe`,

      abandon_ship: `ABANDON SHIP PROCEDURE:
1. Sound abandon ship signal
2. All personnel to muster stations
3. Don lifejackets and immersion suits
4. Launch lifeboats in order
5. Deploy EPIRB and SART
6. Conduct headcount at each station
7. Maintain VHF contact
8. Execute per SOLAS Chapter III`,

      pollution: `POLLUTION RESPONSE:
1. Activate SOPEP plan immediately
2. Identify source and contain spill
3. Deploy oil boom if at sea
4. Alert coastal authorities
5. Document extent and type
6. Prepare POLREP report
7. Implement cleanup procedures`,

      collision: `COLLISION RESPONSE:
1. Sound general alarm
2. Close all watertight doors
3. Damage assessment teams deploy
4. Check for injuries
5. Alert nearby vessels and authorities
6. Assess stability and flooding
7. Prepare damage control measures
8. Document per COLREGS`,
    };

    return recommendations[type] || "AI analysis in progress...";
  };

  const getSeverityColor = (severity: EmergencySeverity) => {
    const colors = {
      low: "text-yellow-500",
      medium: "text-orange-500",
      high: "text-red-500",
      critical: "text-red-700 font-bold",
    };
    return colors[severity];
  };

  const getSeverityBadge = (severity: EmergencySeverity) => {
    const variants = {
      low: "secondary",
      medium: "default",
      high: "destructive",
      critical: "destructive",
    };
    return <Badge variant={variants[severity] as any}>{severity.toUpperCase()}</Badge>;
  };

  const evacuationPlan: EvacuationPlan = {
    vesselName: "MV Nautilus Explorer",
    totalPersonnel: 45,
    musterStations: ["Station A - Bridge Deck", "Station B - Main Deck Starboard", "Station C - Main Deck Port"],
    lifeboats: 6,
    estimatedTime: 15,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-8 w-8 text-destructive" />
          <div>
            <h1 className="text-3xl font-bold">Emergency Response Center</h1>
            <p className="text-muted-foreground">PATCH 69.0 - SAR, Evacuation & AI Response</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" className="gap-2">
            <Radio className="h-4 w-4" />
            Emergency Broadcast
          </Button>
          <Button variant="outline" className="gap-2">
            <Phone className="h-4 w-4" />
            Coast Guard
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Active Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {incidents.filter(i => i.status === "active").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Personnel at Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {incidents.reduce((sum, i) => sum + i.personnel, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Response Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Ready to deploy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.5 min</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="incidents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="incidents">Active Incidents</TabsTrigger>
          <TabsTrigger value="sar">SAR Operations</TabsTrigger>
          <TabsTrigger value="evacuation">Evacuation Plan</TabsTrigger>
          <TabsTrigger value="contacts">Emergency Contacts</TabsTrigger>
        </TabsList>

        {/* Active Incidents */}
        <TabsContent value="incidents" className="space-y-4">
          {incidents.map(incident => (
            <Card 
              key={incident.id}
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => setSelectedIncident(incident)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className={`h-5 w-5 ${getSeverityColor(incident.severity)}`} />
                      {incident.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {incident.location}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getSeverityBadge(incident.severity)}
                    <Badge variant={incident.status === "active" ? "destructive" : "secondary"}>
                      {incident.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(incident.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {incident.personnel} personnel
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}

          {selectedIncident && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Emergency Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleAIAnalysis} 
                  disabled={aiAnalyzing}
                  className="w-full gap-2"
                >
                  <Brain className="h-4 w-4" />
                  {aiAnalyzing ? "Analyzing..." : "Generate AI Response Plan"}
                </Button>

                {selectedIncident.aiRecommendation && (
                  <div className="bg-secondary p-4 rounded-md">
                    <pre className="text-sm whitespace-pre-wrap font-mono">
                      {selectedIncident.aiRecommendation}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* SAR Operations */}
        <TabsContent value="sar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SAR Coordination Center</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Emergency Type</label>
                  <Select value={emergencyType} onValueChange={(v) => setEmergencyType(v as EmergencyType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sar">Man Overboard (SAR)</SelectItem>
                      <SelectItem value="medical">Medical Emergency</SelectItem>
                      <SelectItem value="fire">Fire</SelectItem>
                      <SelectItem value="collision">Collision</SelectItem>
                      <SelectItem value="abandon_ship">Abandon Ship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Position</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border rounded-md"
                    defaultValue="23°45'N 45°12'W"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Incident Description</label>
                <Textarea 
                  placeholder="Describe the emergency situation..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <Button className="w-full gap-2" variant="destructive">
                <Radio className="h-4 w-4" />
                Activate Emergency Response
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evacuation Plan */}
        <TabsContent value="evacuation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vessel Evacuation Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Vessel</p>
                  <p className="text-lg">{evacuationPlan.vesselName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Total Personnel</p>
                  <p className="text-lg font-bold">{evacuationPlan.totalPersonnel}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Available Lifeboats</p>
                  <p className="text-lg">{evacuationPlan.lifeboats}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Est. Evacuation Time</p>
                  <p className="text-lg">{evacuationPlan.estimatedTime} minutes</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Muster Stations</p>
                <div className="space-y-2">
                  {evacuationPlan.musterStations.map((station, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-secondary rounded">
                      <MapPin className="h-4 w-4" />
                      <span>{station}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button className="w-full gap-2" variant="outline">
                <FileText className="h-4 w-4" />
                Download Evacuation Diagram
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Emergency Contacts */}
        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact Directory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Coast Guard (VHF)", contact: "Channel 16", type: "Radio" },
                  { name: "Medical Evacuation", contact: "+55 21 4002-8922", type: "Phone" },
                  { name: "Port Authority", contact: "+55 13 3202-6565", type: "Phone" },
                  { name: "Company Emergency", contact: "+55 21 3333-4444", type: "Phone" },
                  { name: "INMARSAT-C", contact: "424123456", type: "Satellite" },
                ].map((contact, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">{contact.type}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{contact.contact}</span>
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmergencyResponse;
