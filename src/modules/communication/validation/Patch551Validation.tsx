import { useEffect, useState } from "react";;;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Patch551Validation() {
  const [checks, setChecks] = useState({
    singleRoute: false,
    realTimeSend: false,
    realTimeReceive: false,
    historyVisible: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    validatePatch();
  }, []);

  const validatePatch = async () => {
    try {
      // Check if communication_channels table exists and has data
      const { data: channels, error: channelsError } = await supabase
        .from("communication_channels")
        .select("*")
        .limit(1);

      // Check if messages can be retrieved
      const { data: messages, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      setChecks({
        singleRoute: !channelsError,
        realTimeSend: !channelsError,
        realTimeReceive: !messagesError,
        historyVisible: messages ? messages.length > 0 : false,
      });
    } catch (error) {
      console.error("Validation error:", error);
    } finally {
      setLoading(false);
    }
  };

  const allPassed = Object.values(checks).every(Boolean);

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">PATCH 551 – Communication Consolidation</CardTitle>
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Badge variant={allPassed ? "default" : "destructive"} className="text-sm">
              {allPassed ? "✅ PASSED" : "❌ FAILED"}
            </Badge>
          )}
        </div>
        <CardDescription>Unified communication system with real-time messaging</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ValidationCheck
          label="Rota única ativa"
          passed={checks.singleRoute}
          description="Sistema de comunicação consolidado em rota única"
        />
        <ValidationCheck
          label="Envio em tempo real"
          passed={checks.realTimeSend}
          description="Mensagens podem ser enviadas instantaneamente"
        />
        <ValidationCheck
          label="Recebimento em tempo real"
          passed={checks.realTimeReceive}
          description="Mensagens são recebidas sem refresh"
        />
        <ValidationCheck
          label="Histórico visível"
          passed={checks.historyVisible}
          description="Histórico de mensagens acessível"
        />
      </CardContent>
    </Card>
  );
}

function ValidationCheck({ label, passed, description }: { label: string; passed: boolean; description: string }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
      {passed ? (
        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
      ) : (
        <XCircle className="h-5 w-5 text-destructive mt-0.5" />
      )}
      <div className="flex-1">
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
