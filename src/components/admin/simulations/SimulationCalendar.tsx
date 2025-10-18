import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon } from "lucide-react";

export const SimulationCalendar = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Calendário de Simulações
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-muted-foreground">
          <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Calendário de simulações em desenvolvimento</p>
          <p className="text-sm mt-2">
            Visualização de simulações agendadas, realizadas e atrasadas
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
