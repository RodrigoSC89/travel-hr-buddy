// ✅ lib/roles.ts — controle de acesso por perfil

export type Role = "admin" | "operador" | "visitante";

export type ModuleAccess = {
  slug: string;
  roles: Role[];
};

export const modulePermissions: ModuleAccess[] = [
  { slug: "dashboard", roles: ["admin", "operador", "visitante"] },
  { slug: "sistema-maritimo", roles: ["admin", "operador"] },
  { slug: "ia-inovacao", roles: ["admin"] },
  { slug: "portal-funcionario", roles: ["admin", "operador"] },
  { slug: "viagens", roles: ["admin", "operador"] },
  { slug: "alertas-precos", roles: ["admin"] },
  { slug: "hub-integracoes", roles: ["admin"] },
  { slug: "reservas", roles: ["admin", "operador"] },
  { slug: "comunicacao", roles: ["admin", "operador"] },
  { slug: "configuracoes", roles: ["admin"] },
  { slug: "ajuda", roles: ["admin", "operador", "visitante"] },
  { slug: "visao-geral", roles: ["admin", "operador", "visitante"] },
];

export function canAccess(slug: string, role: Role): boolean {
  const mod = modulePermissions.find((m) => m.slug === slug);
  if (!mod) return true; // módulo não registrado = público
  return mod.roles.includes(role);
}
