/**
 * Quality Dashboard Page - Stub
 * Original implementation removed during cleanup
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

const QualityDashboard: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Quality Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Dashboard de qualidade em manutenção.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default QualityDashboard;
