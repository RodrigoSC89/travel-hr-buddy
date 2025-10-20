import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useButtonHandlers } from "@/hooks/useButtonHandlers";

describe("useButtonHandlers", () => {
  // Mock window.alert
  beforeEach(() => {
    vi.spyOn(window, "alert").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should provide all handler functions", () => {
    const { result } = renderHook(() => useButtonHandlers());

    expect(result.current.generateReport).toBeDefined();
    expect(result.current.syncDPLogs).toBeDefined();
    expect(result.current.exportReport).toBeDefined();
    expect(result.current.resetIndicators).toBeDefined();
    expect(result.current.applyMitigation).toBeDefined();
    expect(result.current.defaultFallback).toBeDefined();
  });

  it("should call generateReport correctly", () => {
    const { result } = renderHook(() => useButtonHandlers());

    act(() => {
      result.current.generateReport();
    });

    expect(console.log).toHaveBeenCalledWith("📄 Relatório gerado com sucesso!");
    expect(window.alert).toHaveBeenCalledWith("Relatório DP gerado e salvo com sucesso.");
  });

  it("should call syncDPLogs correctly", () => {
    const { result } = renderHook(() => useButtonHandlers());

    act(() => {
      result.current.syncDPLogs();
    });

    expect(console.log).toHaveBeenCalledWith("🔗 Sincronização DP concluída!");
    expect(window.alert).toHaveBeenCalledWith("Sincronização dos logs de posicionamento finalizada.");
  });

  it("should call exportReport correctly", () => {
    const { result } = renderHook(() => useButtonHandlers());

    act(() => {
      result.current.exportReport();
    });

    expect(console.log).toHaveBeenCalledWith("🧾 Export realizado!");
    expect(window.alert).toHaveBeenCalledWith("Relatório exportado para PDF.");
  });

  it("should call resetIndicators correctly", () => {
    const { result } = renderHook(() => useButtonHandlers());

    act(() => {
      result.current.resetIndicators();
    });

    expect(console.log).toHaveBeenCalledWith("🔄 Indicadores reiniciados!");
    expect(window.alert).toHaveBeenCalledWith("Indicadores restaurados ao padrão.");
  });

  it("should call applyMitigation correctly", () => {
    const { result } = renderHook(() => useButtonHandlers());

    act(() => {
      result.current.applyMitigation();
    });

    expect(console.log).toHaveBeenCalledWith("🛠️ Mitigação aplicada com sucesso!");
    expect(window.alert).toHaveBeenCalledWith("Ação de mitigação FMEA executada.");
  });

  it("should call defaultFallback with label", () => {
    const { result } = renderHook(() => useButtonHandlers());

    act(() => {
      result.current.defaultFallback("Test Button");
    });

    expect(console.warn).toHaveBeenCalledWith("⚠️ Ação não implementada: Test Button");
    expect(window.alert).toHaveBeenCalledWith("Função ainda em desenvolvimento.");
  });

  it("should call defaultFallback without label", () => {
    const { result } = renderHook(() => useButtonHandlers());

    act(() => {
      result.current.defaultFallback();
    });

    expect(console.warn).toHaveBeenCalledWith("⚠️ Ação não implementada: botão genérico");
    expect(window.alert).toHaveBeenCalledWith("Função ainda em desenvolvimento.");
  });
});
