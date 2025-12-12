/**
import { useCallback, useEffect, useState } from "react";;
 * Emergency Mode Component
 * PATCH 850 - Modo de Emergência Marítima
 * 
 * Interface simplificada para operações críticas
 * Funciona 100% offline
 */

import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { 
  AlertTriangle, 
  Phone, 
  Users, 
  MapPin, 
  Clock, 
  Radio,
  Anchor,
  Flame,
  LifeBuoy,
  UserX,
  CheckCircle,
  XCircle,
  FileText,
  Navigation,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface EmergencyContact {
  name: string;
  role: string;
  phone: string;
  type: "mrcc" | "dpa" | "coast_guard" | "company";
}

interface IncidentRecord {
  id: string;
  timestamp: string;
  type: string;
  description: string;
  position: { lat: number; lng: number } | null;
  reportedBy: string;
}

interface CrewMember {
  id: string;
  name: string;
  rank: string;
  station: string;
  status: "safe" | "missing" | "injured" | "unknown";
}

// Default emergency contacts
const DEFAULT_CONTACTS: EmergencyContact[] = [
  { name: "MRCC Singapore", role: "Maritime Rescue", phone: "+65 6325 2488", type: "mrcc" },
  { name: "MRCC Hong Kong", role: "Maritime Rescue", phone: "+852 2233 7999", type: "mrcc" },
  { name: "Company DPA", role: "Designated Person", phone: "+1 555 0123", type: "dpa" },
  { name: "Flag State", role: "Coast Guard", phone: "+1 555 0199", type: "coast_guard" },
];

// Emergency types
const EMERGENCY_TYPES = [
  { id: "mayday", label: "MAYDAY", color: "bg-red-600", description: "Grave and imminent danger" },
  { id: "panpan", label: "PAN-PAN", color: "bg-orange-500", description: "Urgent situation" },
  { id: "fire", label: "Fire", color: "bg-red-500", description: "Fire onboard" },
  { id: "mob", label: "Man Overboard", color: "bg-blue-600", description: "Person in water" },
  { id: "flooding", label: "Flooding", color: "bg-blue-800", description: "Water ingress" },
  { id: "medical", label: "Medical", color: "bg-green-600", description: "Medical emergency" },
  { id: "collision", label: "Collision", color: "bg-yellow-600", description: "Collision/grounding" },
  { id: "abandon", label: "Abandon Ship", color: "bg-purple-700", description: "Abandon vessel" },
];

export const EmergencyMode = memo(function() {
  const { t } = useTranslation("emergency");
  const [activeEmergency, setActiveEmergency] = useState<string | null>(null);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [newIncidentDesc, setNewIncidentDesc] = useState("");
  const [crewStatus, setCrewStatus] = useState<CrewMember[]>([]);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Get GPS position
  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setPosition({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (error) => {
        },
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Load cached data
  useEffect(() => {
    const cached = localStorage.getItem("emergency_incidents");
    if (cached) {
      try {
        setIncidents(JSON.parse(cached));
      } catch (e) {
        console.error("Failed to load cached incidents:", e);
        console.error("Failed to load cached incidents:", e);
      }
    }

    // Mock crew data - in real app, would come from IndexedDB
    setCrewStatus([
      { id: "1", name: "John Smith", rank: "Captain", station: "Bridge", status: "safe" },
      { id: "2", name: "Maria Garcia", rank: "Chief Officer", station: "Bridge", status: "safe" },
      { id: "3", name: "Ahmed Hassan", rank: "Chief Engineer", station: "Engine Room", status: "unknown" },
      { id: "4", name: "Li Wei", rank: "2nd Engineer", station: "Engine Room", status: "safe" },
      { id: "5", name: "Pedro Santos", rank: "Bosun", station: "Deck", status: "safe" },
    ]);
  }, []);

  // Save incidents to localStorage for offline access
  const saveIncidents = useCallback((newIncidents: IncidentRecord[]) => {
    setIncidents(newIncidents);
    localStorage.setItem("emergency_incidents", JSON.stringify(newIncidents));
  }, []);

  // Record new incident
  const recordIncident = useCallback(() => {
    if (!newIncidentDesc.trim()) {
      toast.error("Please enter incident description");
      return;
    }

    const incident: IncidentRecord = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: activeEmergency || "general",
      description: newIncidentDesc,
      position,
      reportedBy: "Current User", // Would come from auth
    };

    saveIncidents([incident, ...incidents]);
    setNewIncidentDesc("");
    toast.success("Incident recorded");
  }, [newIncidentDesc, activeEmergency, position, incidents, saveIncidents]);

  // Update crew member status
  const updateCrewStatus = useCallback((id: string, status: CrewMember["status"]) => {
    setCrewStatus(prev => prev.map(c => 
      c.id === id ? { ...c, status } : c
    ));
  }, []);

  // Format position for display
  const formatPosition = (pos: { lat: number; lng: number } | null): string => {
    if (!pos) return "Acquiring GPS...";
    const latDir = pos.lat >= 0 ? "N" : "S";
    const lngDir = pos.lng >= 0 ? "E" : "W";
    return `${Math.abs(pos.lat).toFixed(4)}°${latDir} ${Math.abs(pos.lng).toFixed(4)}°${lngDir}`;
  };

  const safeCount = crewStatus.filter(c => c.status === "safe").length;
  const missingCount = crewStatus.filter(c => c.status === "missing" || c.status === "unknown").length;

  return (
    <div className="min-h-screen bg-red-950 text-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-10 w-10 text-red-400 animate-pulse" />
          <div>
            <h1 className="text-2xl font-bold text-red-100">{t("title")}</h1>
            <p className="text-red-300 text-sm">{t("subtitle")}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="border-red-400 text-red-100 hover:bg-red-900"
          onClick={handleSetShowExitConfirm}
        >
          {t("exitEmergency")}
        </Button>
      </div>

      {/* GPS Position & Time */}
      <Card className="bg-red-900/50 border-red-700 mb-4">
        <CardContent className="py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-red-300" />
            <span className="font-mono text-lg">{formatPosition(position)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-red-300" />
            <span className="font-mono text-lg">{new Date().toISOString().replace("T", " ").substring(0, 19)} UTC</span>
          </div>
        </CardContent>
      </Card>

      {/* Active Emergency Alert */}
      {activeEmergency && (
        <Card className="bg-red-600 border-red-400 mb-4 animate-pulse">
          <CardContent className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Radio className="h-8 w-8" />
              <div>
                <p className="font-bold text-lg">{t("activeAlert")}</p>
                <p className="text-red-100">{EMERGENCY_TYPES.find(e => e.id === activeEmergency)?.label}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="border-white"
              onClick={handleSetActiveEmergency}
            >
              Cancel Alert
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Emergency Types */}
        <Card className="bg-red-900/50 border-red-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-100 flex items-center gap-2">
              <Radio className="h-5 w-5" />
              Emergency Types
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {EMERGENCY_TYPES.map(type => (
              <Button
                key={type.id}
                className={`${type.color} hover:opacity-80 h-16 flex flex-col`}
                onClick={() => {
                  setActiveEmergency(type.id);
                  toast.warning(`${type.label} alert activated!`);
                }}
              >
                <span className="font-bold">{type.label}</span>
                <span className="text-xs opacity-80">{type.description}</span>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card className="bg-red-900/50 border-red-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-100 flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {DEFAULT_CONTACTS.map((contact, idx) => (
              <a
                key={idx}
                href={`tel:${contact.phone}`}
                className="flex items-center justify-between p-3 bg-red-800/50 rounded-lg hover:bg-red-800 transition-colors"
              >
                <div>
                  <p className="font-semibold">{contact.name}</p>
                  <p className="text-sm text-red-300">{contact.role}</p>
                </div>
                <Badge variant="outline" className="border-red-400 text-red-100">
                  {contact.phone}
                </Badge>
              </a>
            ))}
          </CardContent>
        </Card>

        {/* Crew Muster */}
        <Card className="bg-red-900/50 border-red-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-100 flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t("musterList")} 
              <Badge className="ml-2 bg-green-600">{safeCount} Safe</Badge>
              {missingCount > 0 && (
                <Badge className="bg-yellow-600">{missingCount} Unknown</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-64 overflow-y-auto">
            {crewStatus.map(member => (
              <div 
                key={member.id}
                className="flex items-center justify-between p-2 bg-red-800/30 rounded"
              >
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-xs text-red-300">{member.rank} - {member.station}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={member.status === "safe" ? "default" : "outline"}
                    className={member.status === "safe" ? "bg-green-600" : "border-green-600"}
                    onClick={() => handleupdateCrewStatus}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={member.status === "missing" ? "default" : "outline"}
                    className={member.status === "missing" ? "bg-red-600" : "border-red-600"}
                    onClick={() => handleupdateCrewStatus}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Incident Log */}
        <Card className="bg-red-900/50 border-red-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-100 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t("incidentLog")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-3">
              <Textarea
                value={newIncidentDesc}
                onChange={handleChange}
                placeholder="Describe the incident..."
                className="bg-red-800/50 border-red-600 text-white placeholder:text-red-300"
                rows={2}
              />
              <Button 
                onClick={recordIncident}
                className="w-full bg-red-600 hover:bg-red-500"
              >
                {t("recordIncident")}
              </Button>
            </div>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {incidents.map(incident => (
                <div key={incident.id} className="p-2 bg-red-800/30 rounded text-sm">
                  <div className="flex justify-between text-xs text-red-300 mb-1">
                    <span>{new Date(incident.timestamp).toLocaleTimeString()}</span>
                    <Badge variant="outline" className="text-xs">{incident.type}</Badge>
                  </div>
                  <p>{incident.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Stations */}
      <Card className="bg-red-900/50 border-red-700 mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-red-100 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Emergency Stations
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button className="bg-blue-700 hover:bg-blue-600 h-20 flex flex-col">
            <LifeBuoy className="h-8 w-8 mb-1" />
            <span>{t("lifeboat")}</span>
          </Button>
          <Button className="bg-orange-700 hover:bg-orange-600 h-20 flex flex-col">
            <Flame className="h-8 w-8 mb-1" />
            <span>{t("fireStations")}</span>
          </Button>
          <Button className="bg-blue-900 hover:bg-blue-800 h-20 flex flex-col">
            <UserX className="h-8 w-8 mb-1" />
            <span>{t("manOverboard")}</span>
          </Button>
          <Button className="bg-purple-700 hover:bg-purple-600 h-20 flex flex-col">
            <Anchor className="h-8 w-8 mb-1" />
            <span>{t("abandon")}</span>
          </Button>
        </CardContent>
      </Card>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <Card className="bg-red-900 border-red-600 max-w-md">
            <CardContent className="pt-6">
              <p className="text-lg text-center mb-4">{t("confirmExit")}</p>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 border-red-400"
                  onClick={handleSetShowExitConfirm}
                >
                  {t("cancel", { ns: "common" })}
                </Button>
                <Button 
                  className="flex-1 bg-red-600"
                  onClick={() => {
                    // Navigate away from emergency mode
                    window.location.href = "/";
                  }}
                >
                  {t("confirm", { ns: "common" })}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default EmergencyMode;
