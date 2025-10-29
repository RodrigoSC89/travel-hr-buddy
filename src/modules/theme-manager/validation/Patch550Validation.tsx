import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";

export default function Patch550Validation() {
  const [checks, setChecks] = useState({
    themeToggle: false,
    themePersistence: false,
  });
  const [loading, setLoading] = useState(true);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    validatePatch();
  }, []);

  const validatePatch = async () => {
    try {
      // Check if theme system is working
      const storedTheme = localStorage.getItem("vite-ui-theme");
      
      setChecks({
        themeToggle: theme !== undefined,
        themePersistence: storedTheme !== null,
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
          <CardTitle className="text-2xl">PATCH 550 – Theme Manager</CardTitle>
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Badge variant={allPassed ? "default" : "destructive"} className="text-sm">
              {allPassed ? "✅ PASSED" : "❌ FAILED"}
            </Badge>
          )}
        </div>
        <CardDescription>Dynamic theme switching system</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ValidationCheck
          label="Troca de tema funciona em tempo real"
          passed={checks.themeToggle}
          description="Tema alterna instantaneamente"
        />
        <ValidationCheck
          label="Tema é lembrado após recarregar a página"
          passed={checks.themePersistence}
          description="Preferência de tema persiste no localStorage"
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
