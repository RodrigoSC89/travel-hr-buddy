/**
 * Beta Dashboard - Feedback Results & Analytics
 * Shows aggregated beta feedback data
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/lib/utils/production-logger";
import { 
  BarChart3, 
  Users, 
  Star, 
  MessageSquare, 
  TrendingUp, 
  Send,
  Mail,
  RefreshCw,
  Download
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface FeedbackStats {
  total: number;
  avgOverallRating: number;
  avgOnboardingRating: number;
  avgInterfaceRating: number;
  wouldRecommend: Record<string, number>;
  wouldPay: Record<string, number>;
  errorFrequency: Record<string, number>;
  modulesUsage: Record<string, number>;
  testimonials: Array<{ name: string; text: string; rating: number }>;
}

interface EmailLog {
  id: string;
  recipient_email: string;
  recipient_name: string | null;
  email_type: string;
  subject: string;
  status: string;
  sent_at: string | null;
  created_at: string;
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00C49F"];

const RECOMMEND_LABELS: Record<string, string> = {
  yes_definitely: "Sim, definitivamente",
  probably: "Provavelmente",
  not_sure: "Não tenho certeza",
  probably_not: "Provavelmente não",
  no_definitely_not: "Não",
};

const PAY_LABELS: Record<string, string> = {
  yes_definitely: "Sim, definitivamente",
  probably_yes: "Provavelmente sim",
  need_pricing: "Preciso ver o preço",
  probably_not: "Provavelmente não",
  no: "Não",
};

export default function BetaDashboard() {
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch feedback data - using raw query since table might not be in types yet
      const { data: feedbackData, error } = await supabase
        .from("beta_feedback" as any)
        .select("*");

      if (error) throw error;

      // Calculate stats
      const feedbacks = feedbackData as any[] || [];
      if (feedbacks.length > 0) {
        const total = feedbacks.length;
        const avgOverallRating = feedbacks.reduce((acc, f) => acc + (f.overall_rating || 0), 0) / total;
        const avgOnboardingRating = feedbacks.reduce((acc, f) => acc + (f.onboarding_rating || 0), 0) / total;
        const avgInterfaceRating = feedbacks.reduce((acc, f) => acc + (f.interface_rating || 0), 0) / total;

        // Count recommendations
        const wouldRecommend: Record<string, number> = {};
        feedbacks.forEach((f) => {
          if (f.would_recommend) {
            wouldRecommend[f.would_recommend] = (wouldRecommend[f.would_recommend] || 0) + 1;
          }
        });

        // Count would pay
        const wouldPay: Record<string, number> = {};
        feedbacks.forEach((f) => {
          if (f.would_pay) {
            wouldPay[f.would_pay] = (wouldPay[f.would_pay] || 0) + 1;
          }
        });

        // Count error frequency
        const errorFrequency: Record<string, number> = {};
        feedbacks.forEach((f) => {
          if (f.error_frequency) {
            errorFrequency[f.error_frequency] = (errorFrequency[f.error_frequency] || 0) + 1;
          }
        });

        // Count modules usage
        const modulesUsage: Record<string, number> = {};
        feedbacks.forEach((f) => {
          if (f.modules_used) {
            (f.modules_used as string[]).forEach((m) => {
              modulesUsage[m] = (modulesUsage[m] || 0) + 1;
            });
          }
        });

        // Get testimonials
        const testimonials = feedbacks
          .filter((f) => f.willing_testimonial && f.testimonial_text)
          .map((f) => ({
            name: f.name,
            text: f.testimonial_text as string,
            rating: f.overall_rating || 0,
          }));

        setStats({
          total,
          avgOverallRating,
          avgOnboardingRating,
          avgInterfaceRating,
          wouldRecommend,
          wouldPay,
          errorFrequency,
          modulesUsage,
          testimonials,
        });
      } else {
        setStats({
          total: 0,
          avgOverallRating: 0,
          avgOnboardingRating: 0,
          avgInterfaceRating: 0,
          wouldRecommend: {},
          wouldPay: {},
          errorFrequency: {},
          modulesUsage: {},
          testimonials: [],
        });
      }

      // Fetch email logs
      const { data: logsData } = await supabase
        .from("beta_email_logs" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      setEmailLogs((logsData as unknown as EmailLog[]) || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      logger.error("Error fetching data:", { error: errorMessage });
      toast.error("Erro ao carregar dados: " + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const sendTestEmail = async (type: string) => {
    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-beta-email", {
        body: {
          email_type: type,
          recipient_email: "test@example.com",
          recipient_name: "Test User",
          custom_data: {
            signup_link: "https://nautilus.com/signup",
            survey_link: "https://nautilus.com/feedback",
          },
        },
      });

      if (error) throw error;

      toast.success(`Email de teste (${type}) enviado!`);
      fetchData(); // Refresh logs
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      logger.error("Error sending email:", { error: errorMessage });
      toast.error("Erro ao enviar email: " + errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const exportData = async () => {
    const { data } = await supabase.from("beta_feedback").select("*");
    if (data) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "beta-feedback-export.json";
      a.click();
      toast.success("Dados exportados!");
    }
  };

  const recommendData = Object.entries(stats?.wouldRecommend || {}).map(([key, value]) => ({
    name: RECOMMEND_LABELS[key] || key,
    value,
  }));

  const payData = Object.entries(stats?.wouldPay || {}).map(([key, value]) => ({
    name: PAY_LABELS[key] || key,
    value,
  }));

  const modulesData = Object.entries(stats?.modulesUsage || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Beta Dashboard</h1>
            <p className="text-muted-foreground">Análise de feedback do programa beta</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchData} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
            <Button variant="outline" onClick={exportData}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-100">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Respostas</p>
                  <p className="text-3xl font-bold">{stats?.total || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-yellow-100">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avaliação Média</p>
                  <p className="text-3xl font-bold">{stats?.avgOverallRating.toFixed(1) || "0"}/10</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-100">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Onboarding</p>
                  <p className="text-3xl font-bold">{stats?.avgOnboardingRating.toFixed(1) || "0"}/10</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-purple-100">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Depoimentos</p>
                  <p className="text-3xl font-bold">{stats?.testimonials.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="analytics">
          <TabsList>
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="emails">
              <Mail className="w-4 h-4 mr-2" />
              Emails
            </TabsTrigger>
            <TabsTrigger value="testimonials">
              <MessageSquare className="w-4 h-4 mr-2" />
              Depoimentos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recommendation Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Recomendaria o Nautilus?</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={recommendData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      >
                        {recommendData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-2 mt-4 justify-center">
                    {recommendData.map((item, index) => (
                      <Badge key={item.name} variant="outline" style={{ borderColor: COLORS[index % COLORS.length] }}>
                        {item.name}: {item.value}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Would Pay Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Pagaria pelo Nautilus?</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={payData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      >
                        {payData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-2 mt-4 justify-center">
                    {payData.map((item, index) => (
                      <Badge key={item.name} variant="outline" style={{ borderColor: COLORS[index % COLORS.length] }}>
                        {item.name}: {item.value}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Modules Usage */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Módulos Mais Usados</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={modulesData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="emails" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Enviar Emails Beta</CardTitle>
                <CardDescription>Envie emails de teste para verificar os templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-6">
                  <Button onClick={() => sendTestEmail("invitation")} disabled={isSending}>
                    <Send className="w-4 h-4 mr-2" />
                    Invitation
                  </Button>
                  <Button onClick={() => sendTestEmail("welcome")} disabled={isSending}>
                    <Send className="w-4 h-4 mr-2" />
                    Welcome
                  </Button>
                  <Button onClick={() => sendTestEmail("weekly_checkin")} disabled={isSending}>
                    <Send className="w-4 h-4 mr-2" />
                    Weekly Check-in
                  </Button>
                  <Button onClick={() => sendTestEmail("completion")} disabled={isSending}>
                    <Send className="w-4 h-4 mr-2" />
                    Completion
                  </Button>
                </div>

                <h3 className="font-semibold mb-4">Histórico de Emails</h3>
                <div className="space-y-2">
                  {emailLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{log.subject}</p>
                        <p className="text-sm text-muted-foreground">
                          {log.recipient_name || log.recipient_email} • {log.email_type}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={log.status === "sent" ? "default" : log.status === "failed" ? "destructive" : "secondary"}>
                          {log.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {log.sent_at ? new Date(log.sent_at).toLocaleString() : new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {emailLogs.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">Nenhum email enviado ainda</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="testimonials" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Depoimentos dos Beta Testers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stats?.testimonials.map((t, i) => (
                    <Card key={i} className="bg-muted/50">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-3">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <Star
                              key={j}
                              className={`w-4 h-4 ${
                                j < Math.round(t.rating / 2) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="text-sm text-muted-foreground ml-2">{t.rating}/10</span>
                        </div>
                        <blockquote className="italic text-muted-foreground">"{t.text}"</blockquote>
                        <p className="mt-3 font-medium">— {t.name}</p>
                      </CardContent>
                    </Card>
                  ))}
                  {stats?.testimonials.length === 0 && (
                    <p className="text-center text-muted-foreground py-8 col-span-2">
                      Nenhum depoimento ainda
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
