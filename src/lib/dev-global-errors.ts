export function attachDevGlobalErrorLogs() {
    if (import.meta.env.DEV) {
        window.addEventListener("error", (e) => {
            console.error("[window.onerror]", e.error || e.message || e);
        });
        window.addEventListener("unhandledrejection", (e) => {
            console.error("[unhandledrejection]", e.reason);
        });
    }
}
