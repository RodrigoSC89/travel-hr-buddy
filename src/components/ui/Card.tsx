import { ReactNode } from "react";

export const Card = ({ title, children }: { title: string; children: ReactNode }) => (
  <div
    className="bg-background-surface text-text-base p-4 rounded-2xl shadow-md border border-background-elevated"
  >
    <h2 className="text-lg font-semibold mb-2 text-primary-light">{title}</h2>
    {children}
  </div>
);
