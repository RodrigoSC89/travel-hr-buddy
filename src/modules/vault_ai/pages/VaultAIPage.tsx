import React from "react";
import { VaultSearchResults } from "../components/VaultSearchResults";
import { Database } from "lucide-react";

export const VaultAIPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div><h1 className="text-3xl font-bold flex items-center gap-2"><Database className="h-8 w-8" />Vault AI</h1><p className="text-muted-foreground">PATCH 283 - Vector Search & Semantic Search</p></div>
      <VaultSearchResults />
    </div>
  );
};
