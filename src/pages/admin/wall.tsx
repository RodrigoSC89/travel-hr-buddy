import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MultiTenantWrapper } from "@/components/layout/multi-tenant-wrapper";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, Clock, GitBranch, Volume2, VolumeX, WifiOff, Activity } from "lucide-react";
import { format } from "date-fns";
import { logger } from "@/lib/logger";

interface TestResult {
  id: string;
  branch: string;
  status: "success" | "failure" | "in_progress";
  commit_hash: string;
  created_at: string;
  updated_at: string;
  coverage_percent: number | null;
  triggered_by: string;
  workflow_name?: string;
}

// Environment variables for integrations
const SLACK_WEBHOOK_URL = import.meta.env.VITE_SLACK_WEBHOOK_URL || "";
const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID || "";

export default function AdminWallPage() {
  const [data, setData] = useState<TestResult[]>([]);
  const [offline, setOffline] = useState(false);
  const [muted, setMuted] = useState(false);
  const [lastAlert, setLastAlert] = useState<string>("");

  // Fetch initial data and setup realtime subscription
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
          logger.error("Supabase credentials not configured");
          const cached = localStorage.getItem("ci-wall-data");
          if (cached) {
            setData(JSON.parse(cached));
            setOffline(true);
          }
          return;
        }

        const res = await fetch(`${supabaseUrl}/rest/v1/test_results?select=*&order=created_at.desc&limit=50`, {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const results = await res.json();
        setData(results);
        localStorage.setItem("ci-wall-data", JSON.stringify(results));
        setOffline(false);
      } catch (err) {
        logger.error("Failed to fetch data:", err);
        const cached = localStorage.getItem("ci-wall-data");
        if (cached) {
          setData(JSON.parse(cached));
          setOffline(true);
        }
      }
    };

    fetchInitialData();

    // Setup Supabase Realtime subscription
    const subscription = supabase
      .channel("ci-wall-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "test_results",
        },
        (payload) => {
          const newEntry = payload.new as TestResult;
          setData((prev) => {
            const updated = [newEntry, ...prev];
            localStorage.setItem("ci-wall-data", JSON.stringify(updated));
            return updated;
          });

          // Trigger alerts on failure
          if (newEntry.status === "failure" && newEntry.commit_hash !== lastAlert) {
            if (!muted) {
              const audio = new Audio("/alert.mp3");
              audio.play().catch((err) => logger.error("Failed to play alert:", err));
            }
            setLastAlert(newEntry.commit_hash);

            // Send Slack notification
            if (SLACK_WEBHOOK_URL) {
              fetch(SLACK_WEBHOOK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  text: `⚠️ Build Failed\nBranch: ${newEntry.branch}\nStatus: ${newEntry.status}\nCommit: ${newEntry.commit_hash}`,
                }),
              }).catch((err) => logger.error("Failed to send Slack notification:", err));
            }

            // Send Telegram notification
            if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
              fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: TELEGRAM_CHAT_ID,
                  text: `⚠️ Build Failed\nBranch: ${newEntry.branch}\nStatus: ${newEntry.status}\nCommit: ${newEntry.commit_hash}`,
                }),
              }).catch((err) => logger.error("Failed to send Telegram notification:", err));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [lastAlert, muted]);

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "success":
      return <CheckCircle className="text-green-500" size={32} />;
    case "failure":
      return <XCircle className="text-red-500" size={32} />;
    case "in_progress":
      return <Clock className="text-yellow-500 animate-pulse" size={32} />;
    default:
      return <Clock className="text-gray-500" size={32} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "success":
      return "bg-green-100 border-green-500 dark:bg-green-900/20";
    case "failure":
      return "bg-red-100 border-red-500 dark:bg-red-900/20";
    case "in_progress":
      return "bg-yellow-100 border-yellow-500 dark:bg-yellow-900/20";
    default:
      return "bg-gray-100 border-gray-500 dark:bg-gray-900/20";
    }
  };

  return (
    <MultiTenantWrapper>
      <ModulePageWrapper gradient="purple">
        <ModuleHeader
          icon={Activity}
          title="CI/CD TV Wall"
          description="Monitoramento em tempo real de builds e testes"
          gradient="purple"
          badges={[
            { icon: CheckCircle, label: `${data.filter((d) => d.status === "success").length} Sucesso` },
            { icon: XCircle, label: `${data.filter((d) => d.status === "failure").length} Falhas` },
            { icon: Clock, label: `${data.filter((d) => d.status === "in_progress").length} Em Progresso` }
          ]}
        />

        <div className="space-y-6">
          {/* Controls */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4 items-center justify-between">
                {offline && (
                  <Badge variant="destructive" className="text-lg px-4 py-2">
                    <WifiOff className="mr-2" size={20} />
                    📴 Modo Offline (dados de cache)
                  </Badge>
                )}
                <Button
                  onClick={() => setMuted(!muted)}
                  variant={muted ? "destructive" : "default"}
                  size="lg"
                  className="ml-auto"
                >
                  {muted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                  <span className="ml-2">{muted ? "Alertas Desativados" : "Alertas Ativos"}</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="text-green-500" />
                  Sucesso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-green-500">
                  {data.filter((d) => d.status === "success").length}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-danger/10 to-danger/5 border-danger/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="text-red-500" />
                  Falhas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-red-500">
                  {data.filter((d) => d.status === "failure").length}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="text-yellow-500" />
                  Em Progresso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-yellow-500">
                  {data.filter((d) => d.status === "in_progress").length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Builds */}
          <Card>
            <CardHeader>
              <CardTitle>Builds Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.slice(0, 12).map((result) => (
                  <Card
                    key={result.id}
                    className={`${getStatusColor(result.status)} border-2 transition-all hover:shadow-lg`}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        {getStatusIcon(result.status)}
                        <Badge variant="outline" className="text-xs">
                          {result.workflow_name || "Build"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <GitBranch size={16} />
                          <span className="font-semibold truncate">{result.branch}</span>
                        </div>
                        <div className="text-sm font-mono truncate">
                          {result.commit_hash.slice(0, 7)}
                        </div>
                        <div className="text-xs opacity-75">
                          {format(new Date(result.created_at), "dd/MM/yyyy HH:mm:ss")}
                        </div>
                        {result.coverage_percent !== null && (
                          <div className="text-sm">
                            📊 Cobertura: <span className="font-bold">{result.coverage_percent}%</span>
                          </div>
                        )}
                        <div className="text-xs">
                          Disparado por: <span className="font-semibold">{result.triggered_by}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {data.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-2xl opacity-50">Nenhum resultado de teste disponível</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </ModulePageWrapper>
    </MultiTenantWrapper>
  );
}
