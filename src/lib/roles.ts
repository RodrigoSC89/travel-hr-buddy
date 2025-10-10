// ✅ lib/roles.ts — controle de acesso por perfil

export type Role = "admin" | "hr_manager" | "manager" | "member";

export type ModuleAccess = {
  slug: string;
  roles: Role[];
};

export const modulePermissions: ModuleAccess[] = [
  { slug: "dashboard", roles: ["admin", "hr_manager", "manager", "member"] },
  { slug: "sistema-maritimo", roles: ["admin", "hr_manager", "manager"] },
  { slug: "ia-inovacao", roles: ["admin"] },
  { slug: "portal-funcionario", roles: ["admin", "hr_manager", "manager", "member"] },
  { slug: "viagens", roles: ["admin", "hr_manager", "manager"] },
  { slug: "alertas-precos", roles: ["admin", "hr_manager"] },
  { slug: "hub-integracoes", roles: ["admin"] },
  { slug: "reservas", roles: ["admin", "hr_manager", "manager"] },
  { slug: "comunicacao", roles: ["admin", "hr_manager", "manager", "member"] },
  { slug: "configuracoes", roles: ["admin"] },
  { slug: "ajuda", roles: ["admin", "hr_manager", "manager", "member"] },
  { slug: "visao-geral", roles: ["admin", "hr_manager", "manager", "member"] },
];

export function canAccess(slug: string, role: Role): boolean {
  const mod = modulePermissions.find(m => m.slug === slug);
  if (!mod) return true; // módulo não registrado = público
  return mod.roles.includes(role);
}
