import React from "react";

export default function ControlHubPanel() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4 text-text-base">Indicadores Técnicos</h1>
      <p className="text-text-muted">Painel de Controle Central</p>
      <div className="mt-6 space-y-2">
        <p className="text-alert-success">98.7%</p>
        <p className="text-alert-warning">99.2%</p>
        <p className="text-alert-error">4</p>
      </div>
    </div>
  );
}
