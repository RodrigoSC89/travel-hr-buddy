/**
 * Crew Scheduler Component
 * Planejador visual de escalas com compliance MLC
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Calendar,
  Ship,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  Plane,
  Anchor
} from "lucide-react";

interface CrewRotation {
  crewId: string;
  crewName: string;
  rank: string;
  vessel: string;
  status: "on-board" | "on-leave" | "traveling" | "standby";
  embarkDate: string;
  disembarkDate: string;
  daysOnBoard: number;
  maxDays: number;
  mlcCompliant: boolean;
}

const mockRotations: CrewRotation[] = [
  {
    crewId: "1",
    crewName: "Cap. João Silva",
    rank: "Master",
    vessel: "MV Atlantic Pioneer",
    status: "on-board",
    embarkDate: "2024-12-15",
    disembarkDate: "2025-03-15",
    daysOnBoard: 52,
    maxDays: 90,
    mlcCompliant: true
  },
  {
    crewId: "2",
    crewName: "Carlos Santos",
    rank: "Chief Officer",
    vessel: "MV Atlantic Pioneer",
    status: "on-board",
    embarkDate: "2025-01-10",
    disembarkDate: "2025-04-10",
    daysOnBoard: 26,
    maxDays: 90,
    mlcCompliant: true
  },
  {
    crewId: "3",
    crewName: "Pedro Oliveira",
    rank: "2nd Officer",
    vessel: "MV Atlantic Pioneer",
    status: "on-board",
    embarkDate: "2024-11-01",
    disembarkDate: "2025-02-15",
    daysOnBoard: 96,
    maxDays: 90,
    mlcCompliant: false
  },
  {
    crewId: "4",
    crewName: "Maria Fernanda",
    rank: "Chief Engineer",
    vessel: "MV Atlantic Pioneer",
    status: "traveling",
    embarkDate: "2025-02-08",
    disembarkDate: "2025-05-08",
    daysOnBoard: 0,
    maxDays: 90,
    mlcCompliant: true
  },
  {
    crewId: "5",
    crewName: "Ana Costa",
    rank: "2nd Engineer",
    vessel: "MV Atlantic Pioneer",
    status: "on-leave",
    embarkDate: "2025-03-01",
    disembarkDate: "2025-06-01",
    daysOnBoard: 0,
    maxDays: 90,
    mlcCompliant: true
  }
];

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export function CrewScheduler() {
  const [selectedVessel, setSelectedVessel] = useState("MV Atlantic Pioneer");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const getStatusBadge = (status: CrewRotation["status"]) => {
    switch (status) {
      case "on-board":
        return <Badge className="bg-green-500/10 text-green-500">A Bordo</Badge>;
      case "on-leave":
        return <Badge className="bg-blue-500/10 text-blue-500">Em Licença</Badge>;
      case "traveling":
        return <Badge className="bg-yellow-500/10 text-yellow-500">Em Trânsito</Badge>;
      case "standby":
        return <Badge variant="secondary">Standby</Badge>;
    }
  };

  const getStatusIcon = (status: CrewRotation["status"]) => {
    switch (status) {
      case "on-board":
        return <Anchor className="h-4 w-4 text-green-500" />;
      case "on-leave":
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case "traveling":
        return <Plane className="h-4 w-4 text-yellow-500" />;
      case "standby":
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const stats = {
    onBoard: mockRotations.filter(r => r.status === "on-board").length,
    onLeave: mockRotations.filter(r => r.status === "on-leave").length,
    traveling: mockRotations.filter(r => r.status === "traveling").length,
    mlcViolations: mockRotations.filter(r => !r.mlcCompliant).length
  };

  const isDateInRange = (day: number, embark: string, disembark: string) => {
    const date = new Date(currentYear, currentMonth, day);
    const embarkDate = new Date(embark);
    const disembarkDate = new Date(disembark);
    return date >= embarkDate && date <= disembarkDate;
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">A Bordo</p>
                <p className="text-3xl font-bold text-green-500">{stats.onBoard}</p>
              </div>
              <div className="p-3 rounded-full bg-green-500/10">
                <Anchor className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Licença</p>
                <p className="text-3xl font-bold text-blue-500">{stats.onLeave}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-500/10">
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Trânsito</p>
                <p className="text-3xl font-bold text-yellow-500">{stats.traveling}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-500/10">
                <Plane className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Violações MLC</p>
                <p className="text-3xl font-bold text-red-500">{stats.mlcViolations}</p>
              </div>
              <div className="p-3 rounded-full bg-red-500/10">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select value={selectedVessel} onValueChange={setSelectedVessel}>
                <SelectTrigger className="w-[250px]">
                  <Ship className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MV Atlantic Pioneer">MV Atlantic Pioneer</SelectItem>
                  <SelectItem value="MV Pacific Voyager">MV Pacific Voyager</SelectItem>
                  <SelectItem value="MV Nordic Star">MV Nordic Star</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (currentMonth === 0) {
                    setCurrentMonth(11);
                    setCurrentYear(y => y - 1);
                  } else {
                    setCurrentMonth(m => m - 1);
                  }
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-[150px] text-center font-medium">
                {months[currentMonth]} {currentYear}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (currentMonth === 11) {
                    setCurrentMonth(0);
                    setCurrentYear(y => y + 1);
                  } else {
                    setCurrentMonth(m => m + 1);
                  }
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Rotação
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gantt Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Cronograma de Rotações - {selectedVessel}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 min-w-[200px] sticky left-0 bg-background">
                    Tripulante
                  </th>
                  {days.map(day => (
                    <th key={day} className="p-1 text-center text-xs min-w-[25px]">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockRotations.map((rotation) => (
                  <tr key={rotation.crewId} className="border-b hover:bg-muted/50">
                    <td className="p-3 sticky left-0 bg-background">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(rotation.status)}
                        <div>
                          <p className="font-medium text-sm">{rotation.crewName}</p>
                          <p className="text-xs text-muted-foreground">{rotation.rank}</p>
                        </div>
                        {!rotation.mlcCompliant && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </td>
                    {days.map(day => {
                      const inRange = isDateInRange(day, rotation.embarkDate, rotation.disembarkDate);
                      const isEmbark = new Date(rotation.embarkDate).getDate() === day &&
                        new Date(rotation.embarkDate).getMonth() === currentMonth;
                      const isDisembark = new Date(rotation.disembarkDate).getDate() === day &&
                        new Date(rotation.disembarkDate).getMonth() === currentMonth;

                      return (
                        <td key={day} className="p-0">
                          {inRange && (
                            <div
                              className={`h-6 ${
                                rotation.status === "on-board" 
                                  ? rotation.mlcCompliant ? "bg-green-500" : "bg-red-500"
                                  : rotation.status === "traveling" 
                                    ? "bg-yellow-500" 
                                    : "bg-blue-500"
                              } ${isEmbark ? "rounded-l" : ""} ${isDisembark ? "rounded-r" : ""}`}
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-6 mt-6 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded bg-green-500" />
              <span>A Bordo (Conforme)</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded bg-red-500" />
              <span>A Bordo (MLC Violação)</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded bg-yellow-500" />
              <span>Em Trânsito</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded bg-blue-500" />
              <span>Em Licença</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MLC Alerts */}
      {stats.mlcViolations > 0 && (
        <Card className="border-red-500/50">
          <CardHeader>
            <CardTitle className="text-red-500 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas de Compliance MLC
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockRotations.filter(r => !r.mlcCompliant).map((rotation) => (
                <div key={rotation.crewId} className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="font-medium">{rotation.crewName} - {rotation.rank}</p>
                      <p className="text-sm text-muted-foreground">
                        {rotation.daysOnBoard} dias a bordo (máximo: {rotation.maxDays} dias)
                      </p>
                    </div>
                  </div>
                  <Button variant="destructive" size="sm">
                    Planejar Rendição
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default CrewScheduler;
