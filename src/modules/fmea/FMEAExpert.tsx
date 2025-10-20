import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useButtonHandlers } from "@/hooks/useButtonHandlers";

export default function FMEAExpert() {
  const { applyMitigation } = useButtonHandlers();

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Ações de Mitigação</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={applyMitigation}>Aplicar Mitigação</Button>
        </CardContent>
      </Card>
    </div>
  );
}
