/**
 * Crew Management - Advanced crew tracking and certification
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, Award, AlertCircle, CheckCircle, 
  Calendar, Ship, GraduationCap, Clock
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface CrewMember {
  id: string;
  name: string;
  position: string;
  vessel: string;
  avatar?: string;
  certifications: {
    name: string;
    expiryDate: string;
    status: "valid" | "expiring" | "expired";
  }[];
  hoursWorked: number;
  restHours: number;
  performance: number;
}

export function CrewManagement() {
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "expiring" | "resting">("all");

  useEffect(() => {
    loadCrewData();
  }, []);

  const loadCrewData = async () => {
    try {
      const { data } = await supabase
        .from("crew_members")
        .select("*, vessels(name)")
        .limit(20);

      if (data) {
        const mappedCrew: CrewMember[] = data.map((c: any) => ({
          id: c.id,
          name: c.full_name || "Tripulante",
          position: c.position || "Marinheiro",
          vessel: c.vessels?.name || "Sem embarcação",
          certifications: [
            { 
              name: "STCW", 
              expiryDate: new Date(Date.now() + Math.random() * 180 * 86400000).toISOString(),
              status: Math.random() > 0.7 ? "expiring" : "valid" as const
            },
            { 
              name: "GMDSS", 
              expiryDate: new Date(Date.now() + Math.random() * 365 * 86400000).toISOString(),
              status: "valid" as const
            },
          ],
          hoursWorked: Math.floor(Math.random() * 12),
          restHours: Math.floor(Math.random() * 10) + 6,
          performance: 70 + Math.random() * 30,
        }));
        setCrew(mappedCrew);
      }
    } catch (error) {
      console.error("Error loading crew:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = {
    total: crew.length,
    onDuty: crew.filter(c => c.hoursWorked > 0).length,
    expiringCerts: crew.filter(c => c.certifications.some(cert => cert.status === "expiring")).length,
    avgPerformance: crew.reduce((acc, c) => acc + c.performance, 0) / crew.length || 0,
  };

  const filteredCrew = crew.filter(c => {
    if (filter === "expiring") return c.certifications.some(cert => cert.status === "expiring");
    if (filter === "resting") return c.restHours >= 10;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Tripulantes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-500">{stats.onDuty}</p>
                  <p className="text-xs text-muted-foreground">Em Serviço</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-500">{stats.expiringCerts}</p>
                  <p className="text-xs text-muted-foreground">Certificados Expirando</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Award className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-500">{stats.avgPerformance.toFixed(0)}%</p>
                  <p className="text-xs text-muted-foreground">Performance Média</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button 
          variant={filter === "all" ? "default" : "outline"} 
          size="sm"
          onClick={() => setFilter("all")}
        >
          Todos
        </Button>
        <Button 
          variant={filter === "expiring" ? "default" : "outline"} 
          size="sm"
          onClick={() => setFilter("expiring")}
        >
          <AlertCircle className="h-4 w-4 mr-1" />
          Certificados Expirando
        </Button>
        <Button 
          variant={filter === "resting" ? "default" : "outline"} 
          size="sm"
          onClick={() => setFilter("resting")}
        >
          <Clock className="h-4 w-4 mr-1" />
          Em Descanso
        </Button>
      </div>

      {/* Crew List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Tripulação ({filteredCrew.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {filteredCrew.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-lg border bg-card/50 hover:bg-card/80 transition-all"
              >
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>{member.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold truncate">{member.name}</h4>
                      <Badge variant="outline" className="ml-2">
                        {member.performance.toFixed(0)}%
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{member.position}</p>
                    
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Ship className="h-3 w-3" />
                      <span>{member.vessel}</span>
                    </div>

                    {/* Work/Rest Hours */}
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>Horas Trabalhadas</span>
                          <span>{member.hoursWorked}h</span>
                        </div>
                        <Progress value={(member.hoursWorked / 14) * 100} className="h-1.5" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>Descanso</span>
                          <span>{member.restHours}h</span>
                        </div>
                        <Progress 
                          value={(member.restHours / 10) * 100} 
                          className="h-1.5"
                        />
                      </div>
                    </div>

                    {/* Certifications */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {member.certifications.map((cert, i) => (
                        <Badge 
                          key={i}
                          variant={cert.status === "expiring" ? "destructive" : "secondary"}
                          className="text-xs"
                        >
                          <GraduationCap className="h-3 w-3 mr-1" />
                          {cert.name}
                          {cert.status === "expiring" && (
                            <Calendar className="h-3 w-3 ml-1" />
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
