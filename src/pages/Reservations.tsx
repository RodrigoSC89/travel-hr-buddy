import React from "react";
import { EnhancedReservationsDashboard } from "@/components/reservations/enhanced-reservations-dashboard";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Calendar, Clock, CheckCircle, TrendingUp } from "lucide-react";

const Reservations: React.FC = () => {
  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={Calendar}
        title="Reservas"
        description="Gestão completa de reservas com calendário integrado e acompanhamento de status"
        gradient="blue"
        badges={[
          { icon: Clock, label: "Agendamento Inteligente" },
          { icon: CheckCircle, label: "Confirmações Automáticas" },
          { icon: TrendingUp, label: "Otimização" }
        ]}
      />
      <EnhancedReservationsDashboard />
    </ModulePageWrapper>
  );
};

export default Reservations;