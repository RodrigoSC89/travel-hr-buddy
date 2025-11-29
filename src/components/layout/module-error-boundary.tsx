import React, { ReactNode } from "react";
import * as Sentry from "@sentry/react";

type Props = { children: ReactNode; moduleName?: string };

class InnerBoundary extends React.Component<Props, { error: any }> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { error };
  }

  componentDidCatch(error: any, info: any) {
    Sentry.captureException(error, {
      tags: { module: this.props.moduleName || "Módulo" },
      contexts: { react: { componentStack: info?.componentStack } },
    });
    console.error("[ModuleErrorBoundary]", error);
  }

  render() {
    if (this.state.error) {
      const msg =
        this.state.error?.message ||
        this.state.error?.toString?.() ||
        "Erro desconhecido ao renderizar módulo.";
      return (
        <div className="p-6">
          <h2 className="text-base font-semibold">Falha ao carregar o módulo</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {msg}{" "}
            <button
              className="underline"
              onClick={() => {
                this.setState({ error: null });
                location.reload();
              }}
            >
              Recarregar página
            </button>
          </p>
          <div className="mt-4">
            <button className="text-sm underline" onClick={() => history.back()}>
              Voltar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children as any;
  }
}

const ModuleErrorBoundary: React.FC<Props> = ({ children, moduleName = "Módulo" }) => {
  return <InnerBoundary moduleName={moduleName}>{children}</InnerBoundary>;
};

export default ModuleErrorBoundary;
