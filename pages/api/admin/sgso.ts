import type { NextApiRequest, NextApiResponse } from "next";

// Mock data for SGSO operational risk by vessel
const mockSgsoData = [
  {
    embarcacao: "PSV Atlântico",
    risco: "baixo",
    total: 2,
    por_mes: {
      "Jan": 0,
      "Fev": 0,
      "Mar": 1,
      "Abr": 0,
      "Mai": 0,
      "Jun": 1,
    },
  },
  {
    embarcacao: "OSV Pacífico",
    risco: "moderado",
    total: 8,
    por_mes: {
      "Jan": 1,
      "Fev": 2,
      "Mar": 1,
      "Abr": 1,
      "Mai": 2,
      "Jun": 1,
    },
  },
  {
    embarcacao: "AHTS Brasileiro",
    risco: "alto",
    total: 15,
    por_mes: {
      "Jan": 3,
      "Fev": 2,
      "Mar": 4,
      "Abr": 2,
      "Mai": 3,
      "Jun": 1,
    },
  },
  {
    embarcacao: "PSV Navegante",
    risco: "baixo",
    total: 3,
    por_mes: {
      "Jan": 1,
      "Fev": 0,
      "Mar": 0,
      "Abr": 1,
      "Mai": 0,
      "Jun": 1,
    },
  },
  {
    embarcacao: "OSV Marítimo",
    risco: "moderado",
    total: 6,
    por_mes: {
      "Jan": 1,
      "Fev": 1,
      "Mar": 1,
      "Abr": 1,
      "Mai": 1,
      "Jun": 1,
    },
  },
  {
    embarcacao: "AHTS Oceânico",
    risco: "alto",
    total: 12,
    por_mes: {
      "Jan": 2,
      "Fev": 3,
      "Mar": 2,
      "Abr": 2,
      "Mai": 2,
      "Jun": 1,
    },
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    // Return mock data for SGSO operational risk dashboard
    res.status(200).json(mockSgsoData);
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
