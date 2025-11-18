import React, { useState, Suspense } from "react";

// Developer-only page to dynamically import and render modules at runtime.
// Use the full import path that works in the app, for example:
//  - "@/pages/Dashboard"
//  - "@/modules/ml/heavyModel"
// NOTE: Uses a runtime dynamic import with @vite-ignore so Vite won't try to
// statically analyze every possible path. This file is only mounted in DEV.

export default function ModuleHarness(): JSX.Element {
  const [modulePath, setModulePath] = useState<string>("@");
  const [ModuleComp, setModuleComp] = useState<React.ComponentType<any> | null>(null);
  const [rawExports, setRawExports] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const examples = [
    "@/pages/Dashboard",
    "@/pages/Travel",
    "@/modules/ml/heavyModel",
    "onnxruntime-web",
    "xlsx",
    "three",
  ];

  const load = async (p?: string) => {
    const path = p ?? modulePath;
    setLoading(true);
    setError(null);
    setModuleComp(null);
    setRawExports(null);
    try {
      // @vite-ignore: allow runtime variable import
      const mod = await import(/* @vite-ignore */ path);
      // prefer default export if it's a React component
      const candidate = mod?.default ?? null;
      if (candidate && (typeof candidate === "function" || typeof candidate === "object")) {
        setModuleComp(() => candidate as React.ComponentType<any>);
      } else {
        setRawExports(mod);
      }
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Module Harness (DEV only)</h2>
      <p style={{ maxWidth: 800 }}>
        Use this page to dynamically import a module at runtime. This helps debugging
        heavy modules (onnx, tensorflow, xlsx, three) in isolation without forcing them
        into the main application bundle.
      </p>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input
          style={{ flex: 1, padding: 8 }}
          value={modulePath}
          onChange={(e) => setModulePath(e.target.value)}
          placeholder="Enter import path, e.g. @/pages/Dashboard or xlsx"
        />
        <button onClick={() => load()} disabled={loading}>
          {loading ? "Loading…" : "Load"}
        </button>
        <button onClick={() => { setModuleComp(null); setRawExports(null); setError(null); }}>
          Reset
        </button>
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {examples.map((ex) => (
          <button key={ex} onClick={() => load(ex)} style={{ padding: "6px 10px" }}>
            {ex}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ marginTop: 12, color: "#9b2c2c" }}>
          <strong>Error:</strong>
          <pre style={{ whiteSpace: "pre-wrap" }}>{error}</pre>
        </div>
      )}

      {rawExports && (
        <div style={{ marginTop: 12 }}>
          <h3>Module exports (non-component)</h3>
          <pre style={{ maxHeight: 400, overflow: "auto", background: "#f5f5f5", padding: 12 }}>
            {JSON.stringify(rawExports, null, 2)}
          </pre>
        </div>
      )}

      {ModuleComp && (
        <div style={{ marginTop: 12 }}>
          <h3>Rendered default export</h3>
          <div style={{ border: "1px solid #e6e6e6", padding: 12 }}>
            <Suspense fallback={<div>Rendering...</div>}>
              <ModuleComp />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
}
