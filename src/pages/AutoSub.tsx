import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ship } from "lucide-react";

export default function AutoSub() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Ship className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">AutoSub Mission</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Módulo em Desenvolvimento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Sistema de missões submarinas autônomas em desenvolvimento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
