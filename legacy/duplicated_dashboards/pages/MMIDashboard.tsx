import MMIDashboard from "@/components/mmi/Dashboard";

export default function MMIDashboardPage() {
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Dashboard de BI - MMI</h1>
        <p className="text-muted-foreground">
          Módulo de Business Intelligence para Manutenção e Manutenibilidade Industrial
        </p>
      </div>
      <MMIDashboard />
    </div>
  );
}
