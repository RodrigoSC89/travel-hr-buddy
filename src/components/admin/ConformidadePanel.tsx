import React from "react";

interface NormScore {
  name: string;
  score: number;
}

interface VesselCompliance {
  vessel: string;
  norms: NormScore[];
}

interface CompliancePanelProps {
  data: VesselCompliance[];
}

export function CompliancePanel({ data }: CompliancePanelProps) {
  return (
    <div className="grid gap-4">
      <h2 className="text-xl font-bold">📐 Conformidade Normativa</h2>
      {data.map((item) => (
        <div key={item.vessel}>
          <h3 className="text-lg font-semibold">{item.vessel}</h3>
          <div className="flex items-center space-x-4">
            {item.norms.map(norm => (
              <div key={norm.name} className="flex flex-col items-center bg-white shadow p-4 rounded">
                <span className="text-sm">{norm.name}</span>
                <span className={`font-bold text-xl ${norm.score >= 80 ? 'text-green-600' : 'text-red-500'}`}>{norm.score}%</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
