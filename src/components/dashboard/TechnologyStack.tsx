/**
 * Technology Stack Section - Lazy Loaded Component
 */
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";

export function TechnologyStack() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Stack Tecnológico
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 border rounded-lg">
            <p className="font-semibold">Frontend</p>
            <p className="text-sm text-muted-foreground mt-1">React + TypeScript</p>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <p className="font-semibold">Backend</p>
            <p className="text-sm text-muted-foreground mt-1">Supabase + Edge Functions</p>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <p className="font-semibold">AI/ML</p>
            <p className="text-sm text-muted-foreground mt-1">ONNX Runtime + WebGPU</p>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <p className="font-semibold">Database</p>
            <p className="text-sm text-muted-foreground mt-1">PostgreSQL + Vector</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
