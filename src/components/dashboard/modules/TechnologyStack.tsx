/**
 * Technology Stack Component
 * PATCH 621: Lazy loaded technology stack
 */

import React from "react";

export default function TechnologyStack() {
  React.useEffect(() => {
    console.log("✅ TechnologyStack loaded");
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="text-center p-4 border rounded-lg">
        <p className="font-semibold">Frontend</p>
        <p className="text-sm text-muted-foreground mt-1">React + TypeScript</p>
      </div>
      <div className="text-center p-4 border rounded-lg">
        <p className="font-semibold">Backend</p>
        <p className="text-sm text-muted-foreground mt-1">Supabase + Edge Functions</p>
      </div>
      <div className="text-center p-4 border rounded-lg">
        <p className="font-semibold">AI/ML</p>
        <p className="text-sm text-muted-foreground mt-1">ONNX Runtime + WebGPU</p>
      </div>
      <div className="text-center p-4 border rounded-lg">
        <p className="font-semibold">Database</p>
        <p className="text-sm text-muted-foreground mt-1">PostgreSQL + Vector</p>
      </div>
    </div>
  );
}
