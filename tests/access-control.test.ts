import { describe, it, expect } from "vitest";
import { canAccess } from "@/lib/roles";

describe("canAccess", () => {
  it("permite admin acessar qualquer módulo registrado", () => {
    expect(canAccess("dashboard", "admin")).toBe(true);
    expect(canAccess("configuracoes", "admin")).toBe(true);
  });

  it("nega acesso para visitante onde não é permitido", () => {
    expect(canAccess("hub-integracoes", "visitante")).toBe(false);
    expect(canAccess("ajuda", "visitante")).toBe(true);
  });

  it("permite operador onde autorizado", () => {
    expect(canAccess("reservas", "operador")).toBe(true);
    expect(canAccess("configuracoes", "operador")).toBe(false);
  });

  it("retorna true por padrão se módulo não está listado", () => {
    expect(canAccess("nao-listado", "visitante")).toBe(true);
  });
});
