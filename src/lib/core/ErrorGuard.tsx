// src/lib/core/ErrorGuard.tsx
import React from "react";

export class ErrorGuard extends React.Component<{ children: React.ReactNode }> {
  state = { hasError: false, error: null as any };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    console.error("💥 ErrorGuard capturou um erro:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "2rem", color: "#fff", background: "#c0392b" }}>
          <h2>🚨 Falha de módulo detectada</h2>
          <p>O sistema detectou um erro no componente.</p>
          <p><code>{String(this.state.error)}</code></p>
          <button onClick={() => location.reload()}>Recarregar</button>
        </div>
      );
    }
    return this.props.children;
  }
}
