/**
 * Loader Component
 * Professional loading indicator with accessibility support
 */

export function Loader() {
  return (
    <div 
      className="flex items-center justify-center min-h-[400px]"
      role="status"
      aria-live="polite"
      aria-label="Carregando conteúdo"
    >
      <div className="text-center">
        <div 
          className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--nautilus-primary)] mb-4" 
          aria-hidden="true"
        />
        <p className="text-lg font-medium text-[var(--nautilus-text)]">
          ⏳ Carregando...
        </p>
        <p className="text-sm text-[var(--nautilus-text-muted)] mt-2">
          Aguarde um momento
        </p>
      </div>
    </div>
  );
}
