import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Award,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Target,
  Zap,
} from "lucide-react";

interface CrewMember {
  id: string;
  name: string;
  position: string;
  vessel: string;
  competencies: {
    skill: string;
    level: number; // 0-100
    required: number; // 0-100
    certified: boolean;
    expiryDate?: string;
  }[];
  overallScore: number;
  gaps: number;
  certifications: number;
}

export const CompetencyHeatmap: React.FC = () => {
  const [crew, setCrew] = useState<CrewMember[]>([
    {
      id: "1",
      name: "João Silva",
      position: "Capitão",
      vessel: "MV-Atlas",
      competencies: [
        { skill: "Navegação", level: 95, required: 90, certified: true, expiryDate: "2026-03-15" },
        {
          skill: "DP Operations",
          level: 88,
          required: 85,
          certified: true,
          expiryDate: "2025-08-20",
        },
        { skill: "STCW", level: 100, required: 100, certified: true, expiryDate: "2025-12-10" },
        {
          skill: "Gestão de Crise",
          level: 92,
          required: 85,
          certified: true,
          expiryDate: "2026-01-05",
        },
        { skill: "Inglês Técnico", level: 85, required: 80, certified: true },
      ],
      overallScore: 92,
      gaps: 0,
      certifications: 5,
    },
    {
      id: "2",
      name: "Maria Santos",
      position: "Chefe de Máquinas",
      vessel: "MV-Neptune",
      competencies: [
        {
          skill: "Manutenção Diesel",
          level: 90,
          required: 85,
          certified: true,
          expiryDate: "2025-11-30",
        },
        {
          skill: "Sistemas Elétricos",
          level: 75,
          required: 80,
          certified: true,
          expiryDate: "2025-06-15",
        },
        { skill: "STCW", level: 100, required: 100, certified: true, expiryDate: "2026-02-20" },
        { skill: "Hidráulica", level: 82, required: 75, certified: true, expiryDate: "2025-09-10" },
        { skill: "Automação", level: 68, required: 75, certified: false },
      ],
      overallScore: 83,
      gaps: 2,
      certifications: 4,
    },
    {
      id: "3",
      name: "Pedro Oliveira",
      position: "Imediato",
      vessel: "MV-Poseidon",
      competencies: [
        { skill: "Navegação", level: 85, required: 85, certified: true, expiryDate: "2025-07-22" },
        { skill: "DP Operations", level: 72, required: 80, certified: false },
        { skill: "STCW", level: 100, required: 100, certified: true, expiryDate: "2025-05-30" },
        {
          skill: "Carga/Descarga",
          level: 88,
          required: 80,
          certified: true,
          expiryDate: "2026-04-12",
        },
        {
          skill: "Primeiros Socorros",
          level: 78,
          required: 75,
          certified: true,
          expiryDate: "2025-10-08",
        },
      ],
      overallScore: 85,
      gaps: 1,
      certifications: 4,
    },
    {
      id: "4",
      name: "Ana Costa",
      position: "Oficial de Náutica",
      vessel: "MV-Atlas",
      competencies: [
        { skill: "Navegação", level: 78, required: 75, certified: true, expiryDate: "2025-09-18" },
        { skill: "STCW", level: 100, required: 100, certified: true, expiryDate: "2025-04-25" },
        {
          skill: "Comunicações",
          level: 92,
          required: 80,
          certified: true,
          expiryDate: "2026-06-30",
        },
        { skill: "Meteorologia", level: 65, required: 70, certified: false },
        { skill: "Inglês Técnico", level: 88, required: 75, certified: true },
      ],
      overallScore: 85,
      gaps: 1,
      certifications: 4,
    },
  ]);

  const skills = [
    "Navegação",
    "DP Operations",
    "STCW",
    "Manutenção Diesel",
    "Sistemas Elétricos",
    "Gestão de Crise",
    "Carga/Descarga",
    "Inglês Técnico",
    "Primeiros Socorros",
    "Hidráulica",
    "Automação",
    "Comunicações",
    "Meteorologia",
  ];

  const getSkillLevel = (member: CrewMember, skill: string) => {
    const comp = member.competencies.find(c => c.skill === skill);
    return comp ? comp.level : 0;
  };

  const getSkillStatus = (member: CrewMember, skill: string) => {
    const comp = member.competencies.find(c => c.skill === skill);
    if (!comp) return "none";
    if (!comp.certified) return "gap";
    if (comp.level < comp.required) return "gap";
    if (comp.expiryDate) {
      const expiryDate = new Date(comp.expiryDate);
      const daysUntilExpiry = Math.floor(
        (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilExpiry < 90) return "expiring";
    }
    return "good";
  };

  const getHeatmapColor = (level: number, status: string) => {
    if (status === "none") return "bg-gray-100 dark:bg-gray-800";
    if (status === "gap") return "bg-red-200 dark:bg-red-900";
    if (status === "expiring") return "bg-yellow-200 dark:bg-yellow-900";
    if (level >= 90) return "bg-green-500";
    if (level >= 75) return "bg-green-400";
    if (level >= 60) return "bg-yellow-400";
    return "bg-orange-400";
  };

  const totalGaps = crew.reduce((sum, m) => sum + m.gaps, 0);
  const avgScore = Math.round(crew.reduce((sum, m) => sum + m.overallScore, 0) / crew.length);
  const expiringCerts = crew.reduce((sum, m) => {
    return (
      sum +
      m.competencies.filter(c => {
        if (!c.expiryDate) return false;
        const daysUntil = Math.floor(
          (new Date(c.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        return daysUntil < 90;
      }).length
    );
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tripulantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{crew.length}</div>
            <p className="text-xs text-muted-foreground">Ativos no sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Competência Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgScore}%</div>
            <p className="text-xs text-muted-foreground">Score geral</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Gaps Identificados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalGaps}</div>
            <p className="text-xs text-muted-foreground">Requerem atenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Cert. Vencendo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{expiringCerts}</div>
            <p className="text-xs text-muted-foreground">Próximos 90 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Heatmap */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Mapa de Competências da Tripulação
              </CardTitle>
              <CardDescription>
                Visualização de habilidades, gaps e certificações por membro
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <BookOpen className="h-4 w-4 mr-2" />
                Plano de Treinamento
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Legend */}
          <div className="mb-6 p-4 bg-muted/50 rounded-lg">
            <div className="text-sm font-medium mb-2">Legenda:</div>
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Excelente (90-100%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-400 rounded"></div>
                <span>Bom (75-89%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                <span>Adequado (60-74%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-200 dark:bg-red-900 rounded"></div>
                <span>Gap (abaixo do requerido)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-200 dark:bg-yellow-900 rounded"></div>
                <span>Certificação vencendo</span>
              </div>
            </div>
          </div>

          {/* Heatmap Table */}
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              {/* Header */}
              <div className="flex border-b border-border">
                <div className="w-48 p-3 font-medium">Tripulante</div>
                {skills.map(skill => (
                  <div key={skill} className="w-24 p-3 text-xs font-medium text-center">
                    <div className="transform -rotate-45 origin-left whitespace-nowrap">
                      {skill}
                    </div>
                  </div>
                ))}
                <div className="w-32 p-3 font-medium text-center">Score</div>
              </div>

              {/* Crew Rows */}
              {crew.map(member => (
                <div key={member.id} className="flex border-b border-border hover:bg-muted/50">
                  <div className="w-48 p-3">
                    <div className="font-medium text-sm">{member.name}</div>
                    <div className="text-xs text-muted-foreground">{member.position}</div>
                    <Badge variant="outline" className="text-xs mt-1">
                      {member.vessel}
                    </Badge>
                  </div>
                  {skills.map(skill => {
                    const level = getSkillLevel(member, skill);
                    const status = getSkillStatus(member, skill);
                    return (
                      <div
                        key={skill}
                        className="w-24 p-3 flex items-center justify-center group relative"
                      >
                        <div
                          className={`w-16 h-8 rounded flex items-center justify-center ${getHeatmapColor(level, status)} transition-all`}
                        >
                          {level > 0 && <span className="text-xs font-medium">{level}%</span>}
                        </div>
                        {/* Tooltip */}
                        {level > 0 && (
                          <div className="absolute hidden group-hover:block bg-popover text-popover-foreground p-2 rounded shadow-lg z-10 bottom-full mb-1 whitespace-nowrap text-xs">
                            <div className="font-medium">{skill}</div>
                            <div>Nível: {level}%</div>
                            <div>
                              Requerido:{" "}
                              {member.competencies.find(c => c.skill === skill)?.required}%
                            </div>
                            {member.competencies.find(c => c.skill === skill)?.expiryDate && (
                              <div className="text-yellow-600">
                                Vence:{" "}
                                {new Date(
                                  member.competencies.find(c => c.skill === skill)!.expiryDate!
                                ).toLocaleDateString("pt-BR")}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div className="w-32 p-3 flex items-center justify-center">
                    <div className="text-center">
                      <div
                        className={`text-2xl font-bold ${
                          member.overallScore >= 90
                            ? "text-green-600"
                            : member.overallScore >= 75
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {member.overallScore}%
                      </div>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        {member.gaps > 0 ? (
                          <Badge variant="destructive" className="text-xs">
                            {member.gaps} gap{member.gaps > 1 ? "s" : ""}
                          </Badge>
                        ) : (
                          <Badge variant="default" className="text-xs bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            OK
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Individual Cards */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {crew
              .filter(m => m.gaps > 0)
              .map(member => (
                <Card key={member.id} className="border-l-4 border-l-red-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{member.name}</CardTitle>
                        <CardDescription>
                          {member.position} - {member.vessel}
                        </CardDescription>
                      </div>
                      <Badge variant="destructive">
                        {member.gaps} Gap{member.gaps > 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {member.competencies
                      .filter(c => !c.certified || c.level < c.required)
                      .map((comp, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950 rounded-lg"
                        >
                          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{comp.skill}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {!comp.certified ? (
                                <span className="text-red-600">Não certificado</span>
                              ) : (
                                <span>
                                  Nível {comp.level}% (requerido: {comp.required}%)
                                </span>
                              )}
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            <Target className="h-3 w-3 mr-1" />
                            Treinar
                          </Button>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompetencyHeatmap;
