export default function Unauthorized() {
  return (
    <div className="flex items-center justify-center h-screen bg-white text-red-600">
      <div className="text-center">
        <h1 className="text-3xl font-bold">⛔ Acesso Negado</h1>
        <p className="mt-4 text-lg">Você não tem permissão para visualizar esta página.</p>
        <p className="text-sm text-muted-foreground mt-2">Token de acesso inválido ou ausente.</p>
      </div>
    </div>
  );
}
