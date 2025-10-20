/**
 * VaultAI Page Component
 * Page wrapper for Vault Técnico IA module
 */

import { VaultCore } from "@/modules/vault_ai";

export default function VaultAI() {
  return (
    <div className="container mx-auto p-6">
      <VaultCore />
    </div>
  );
}
