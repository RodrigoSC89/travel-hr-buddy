/**
 * Social Sustainability Panel - S do ESG
 * Monitoramento de bem-estar da tripulação, segurança e direitos humanos
 */

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users,
  Heart,
  Shield,
  Clock,
  Home,
  Wifi,
  GraduationCap,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Award,
  MessageSquare,
  UserCheck,
  Activity,
  Smile,
  Globe,
  Scale,
  FileText
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from "recharts";

const welfareScores = [
  { subject: "Segurança", score: 92, fullMark: 100 },
  { subject: "Saúde", score: 88, fullMark: 100 },
  { subject: "Descanso", score: 85, fullMark: 100 },
  { subject: "Acomodação", score: 90, fullMark: 100 },
  { subject: "Alimentação", score: 94, fullMark: 100 },
  { subject: "Comunicação", score: 78, fullMark: 100 }
];

const safetyMetrics = [
  { month: "Jan", lti: 0, nearMiss: 3, drills: 12 },
  { month: "Fev", lti: 0, nearMiss: 2, drills: 14 },
  { month: "Mar", lti: 1, nearMiss: 4, drills: 11 },
  { month: "Abr", lti: 0, nearMiss: 1, drills: 15 },
  { month: "Mai", lti: 0, nearMiss: 2, drills: 13 },
  { month: "Jun", lti: 0, nearMiss: 1, drills: 14 }
];

const diversityData = {
  gender: { male: 92, female: 8 },
  nationality: [
    { country: "Brasil", percentage: 65 },
    { country: "Filipinas", percentage: 15 },
    { country: "Índia", percentage: 10 },
    { country: "Outros", percentage: 10 }
  ]
};

const mlcCompliance = [
  { area: "Idade Mínima", status: "compliant", score: 100 },
  { area: "Certificação Médica", status: "compliant", score: 100 },
  { area: "Treinamento e Qualificação", status: "compliant", score: 98 },
  { area: "Contrato de Trabalho (SEA)", status: "compliant", score: 100 },
  { area: "Horas de Trabalho/Descanso", status: "warning", score: 92 },
  { area: "Acomodações", status: "compliant", score: 95 },
  { area: "Alimentação", status: "compliant", score: 98 },
  { area: "Saúde e Segurança", status: "compliant", score: 94 },
  { area: "Bem-estar", status: "compliant", score: 88 }
];

export const SocialSustainabilityPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Shield className="h-5 w-5 text-green-600" />
              <Badge className="bg-green-500">Excelente</Badge>
            </div>
            <p className="text-2xl font-bold">245</p>
            <p className="text-sm text-muted-foreground">Dias sem LTI</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <div className="flex items-center text-sm text-green-600">
                <TrendingDown className="h-4 w-4 mr-1" />
                -18%
              </div>
            </div>
            <p className="text-2xl font-bold">0.42</p>
            <p className="text-sm text-muted-foreground">LTIFR</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold">487</p>
            <p className="text-sm text-muted-foreground">Total Tripulantes</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <GraduationCap className="h-5 w-5 text-amber-600" />
            </div>
            <p className="text-2xl font-bold">96%</p>
            <p className="text-sm text-muted-foreground">Treinamento Compliance</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500/10 to-pink-600/10 border-pink-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Smile className="h-5 w-5 text-pink-600" />
            </div>
            <p className="text-2xl font-bold">8.2/10</p>
            <p className="text-sm text-muted-foreground">Satisfação da Tripulação</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Welfare Radar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Índice de Bem-estar
            </CardTitle>
            <CardDescription>Score por dimensão MLC 2006</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={welfareScores}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Score" dataKey="score" stroke="#22c55e" fill="#22c55e" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Safety Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Performance de Segurança
            </CardTitle>
            <CardDescription>LTIs, Near Misses e Simulados</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={safetyMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="lti" fill="#ef4444" name="LTI" />
                <Bar dataKey="nearMiss" fill="#f59e0b" name="Near Miss" />
                <Bar dataKey="drills" fill="#22c55e" name="Simulados" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MLC 2006 Compliance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Compliance MLC 2006
            </CardTitle>
            <CardDescription>Status por área regulatória</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {mlcCompliance.map((item) => (
                  <div key={item.area} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {item.status === "compliant" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      )}
                      <span className="font-medium">{item.area}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={item.score} className="w-20 h-2" />
                      <span className="text-sm font-medium w-10">{item.score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Diversity & Inclusion */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Diversidade & Inclusão
            </CardTitle>
            <CardDescription>Composição da força de trabalho</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-3">Diversidade de Gênero</h4>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Masculino</span>
                    <span>{diversityData.gender.male}%</span>
                  </div>
                  <Progress value={diversityData.gender.male} className="h-3" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Feminino</span>
                    <span>{diversityData.gender.female}%</span>
                  </div>
                  <Progress value={diversityData.gender.female} className="h-3" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Meta: 15% mulheres até 2028 (IMO Women in Maritime)
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3">Diversidade de Nacionalidade</h4>
              <div className="space-y-2">
                {diversityData.nationality.map((item) => (
                  <div key={item.country} className="flex items-center gap-3">
                    <span className="w-24 text-sm">{item.country}</span>
                    <Progress value={item.percentage} className="flex-1 h-2" />
                    <span className="text-sm font-medium w-10">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">23</p>
                  <p className="text-sm text-muted-foreground">Nacionalidades</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">42</p>
                  <p className="text-sm text-muted-foreground">Idade Média</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações de Bem-estar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-16 flex flex-col gap-1">
              <MessageSquare className="h-5 w-5" />
              <span className="text-xs">Pesquisa de Satisfação</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col gap-1">
              <Heart className="h-5 w-5" />
              <span className="text-xs">Relatório Saúde Mental</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col gap-1">
              <Clock className="h-5 w-5" />
              <span className="text-xs">Análise Work/Rest</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col gap-1">
              <FileText className="h-5 w-5" />
              <span className="text-xs">DMLC Part II</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialSustainabilityPanel;
