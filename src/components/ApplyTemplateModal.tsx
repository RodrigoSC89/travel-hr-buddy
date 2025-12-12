// @ts-nocheck
import React from "react";

// ✅ Minimal functional stub of ApplyTemplateModal
// Ensures compatibility with tests and builds
// Prevents ReferenceError issues during SSR and CI builds

export default function ApplyTemplateModal({
  tableName,
  onApply,
}: {
  tableName?: string;
  onApply?: (content: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onApply && onApply(`<p>Template aplicado: ${tableName}</p>`)}
      className="hidden"
      aria-hidden
    >
      Aplicar Template
    </button>
  );
}
