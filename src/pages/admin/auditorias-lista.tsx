import { ListaAuditoriasIMCA } from "@/components/sgso/ListaAuditoriasIMCA";

export default function AuditoriasListaPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Lista de Auditorias IMCA</h1>
        <p className="text-muted-foreground mt-2">
          Visualize, filtre e exporte auditorias técnicas registradas
        </p>
      </div>
      <ListaAuditoriasIMCA />
    </div>
  );
}
