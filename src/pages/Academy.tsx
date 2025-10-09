import React from "react";
import { NautilusAcademy } from "@/components/strategic/NautilusAcademy";
import { GraduationCap } from "lucide-react";

const Academy = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-lg bg-primary/10">
          <GraduationCap className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Academia Nautilus</h1>
          <p className="text-muted-foreground">Centro de treinamento e certificação</p>
        </div>
      </div>
      <NautilusAcademy />
    </div>
  );
};

export default Academy;
