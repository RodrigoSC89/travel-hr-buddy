import * as React from "react";
import type { Member } from "./types";

export interface CtContextValue {
  me: Member;
  members: Member[];
}

const CtContext = React.createContext<CtContextValue | null>(null);

export const CtProvider = CtContext.Provider;

export function useCtContext(): CtContextValue {
  const ctx = React.useContext(CtContext);
  if (!ctx) throw new Error("useCtContext must be used inside the Control Tower");
  return ctx;
}
