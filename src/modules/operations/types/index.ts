/**
 * Operations Module Types
 */

export interface Voyage {
  id: string;
  voyageNumber: string;
  vesselName: string;
  vesselIMO: string;
  departurePort: string;
  arrivalPort: string;
  departureTime: string;
  estimatedArrival: string;
  status: "planning" | "loading" | "underway" | "anchored" | "discharging" | "completed";
  progress: number;
}

export interface Mission {
  id: string;
  name: string;
  type: string;
  status: string;
  vesselId: string;
}
