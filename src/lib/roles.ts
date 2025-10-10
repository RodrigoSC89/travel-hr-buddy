// Define roles types
export type Role = "admin" | "operador" | "visitante" | string;

// Define module access control
const moduleAccessControl: Record<string, Role[]> = {
  dashboard: ["admin", "operador", "visitante"],
  configuracoes: ["admin"],
  "hub-integracoes": ["admin", "operador"],
  ajuda: ["admin", "operador", "visitante"],
  reservas: ["admin", "operador"],
};

/**
 * Check if a role can access a specific module
 * @param module - The module to check access for
 * @param role - The user's role
 * @returns true if the role can access the module, false otherwise
 */
export const canAccess = (module: string, role: Role): boolean => {
  // If module is not in the access control list, default to true
  if (!moduleAccessControl[module]) {
    return true;
  }

  // Check if the role is in the allowed roles for the module
  return moduleAccessControl[module].includes(role);
};
