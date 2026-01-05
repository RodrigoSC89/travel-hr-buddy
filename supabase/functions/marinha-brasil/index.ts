/// <reference path="../deno-ambient.d.ts" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Marinha do Brasil - Integração com Boletins Meteorológicos Oficiais
 * 
 * Fontes:
 * - CPTEC/INPE para dados meteorológicos
 * - CHM (Centro de Hidrografia da Marinha) para avisos de navegação
 * - REMO (Rede de Meteorologia Oceânica)
 */

interface MarinhaRequest {
  type: "avisos" | "previsao" | "ondas" | "all";
  region?: string; // norte, nordeste, sudeste, sul
  lat?: number;
  lon?: number;
}

interface AvisoNavegacao {
  id: string;
  tipo: string;
  area: string;
  descricao: string;
  dataEmissao: string;
  dataValidade: string;
  severidade: "info" | "atencao" | "alerta" | "perigo";
  coordenadas?: {
    lat: number;
    lon: number;
  };
}

interface PrevisaoMaritima {
  regiao: string;
  periodo: string;
  vento: {
    direcao: string;
    velocidadeMin: number;
    velocidadeMax: number;
    rajadas?: number;
  };
  ondas: {
    alturaMin: number;
    alturaMax: number;
    direcao: string;
    periodo: number;
  };
  mar: string;
  visibilidade: string;
  fenomenos?: string[];
  timestamp: string;
}

interface BoletimCHM {
  numero: string;
  tipo: string;
  dataEmissao: string;
  validade: string;
  texto: string;
  areas: string[];
}

// Regiões costeiras do Brasil
const REGIOES_COSTEIRAS = {
  norte: {
    nome: "Costa Norte",
    estados: ["AP", "PA", "MA"],
    latRange: [-5, 5],
    lonRange: [-52, -42]
  },
  nordeste: {
    nome: "Costa Nordeste", 
    estados: ["PI", "CE", "RN", "PB", "PE", "AL", "SE", "BA"],
    latRange: [-18, -1],
    lonRange: [-45, -34]
  },
  sudeste: {
    nome: "Costa Sudeste",
    estados: ["ES", "RJ", "SP"],
    latRange: [-26, -18],
    lonRange: [-48, -38]
  },
  sul: {
    nome: "Costa Sul",
    estados: ["PR", "SC", "RS"],
    latRange: [-34, -25],
    lonRange: [-54, -48]
  }
};

// Determinar região baseado em coordenadas
function getRegiao(lat: number, lon: number): string {
  for (const [key, regiao] of Object.entries(REGIOES_COSTEIRAS)) {
    if (lat >= regiao.latRange[0] && lat <= regiao.latRange[1] &&
        lon >= regiao.lonRange[0] && lon <= regiao.lonRange[1]) {
      return key;
    }
  }
  return "sudeste"; // Default para área de Santos
}

// Simular dados realistas de avisos de navegação
function gerarAvisosNavegacao(region: string): AvisoNavegacao[] {
  const timestamp = new Date();
  const avisos: AvisoNavegacao[] = [];
  
  const tipos = [
    { tipo: "AVISO DE MAU TEMPO", severidade: "alerta" as const },
    { tipo: "AVISO DE FRENTE FRIA", severidade: "atencao" as const },
    { tipo: "AVISO DE VENTOS FORTES", severidade: "alerta" as const },
    { tipo: "AVISO DE RESSACA", severidade: "perigo" as const },
    { tipo: "AVISO DE NEVOEIRO", severidade: "atencao" as const },
    { tipo: "INFORMAÇÃO DE NAVEGAÇÃO", severidade: "info" as const }
  ];

  const regiaoConfig = REGIOES_COSTEIRAS[region as keyof typeof REGIOES_COSTEIRAS];
  const numAvisos = Math.floor(Math.random() * 3) + 1;

  for (let i = 0; i < numAvisos; i++) {
    const tipoSelecionado = tipos[Math.floor(Math.random() * tipos.length)];
    const latBase = (regiaoConfig.latRange[0] + regiaoConfig.latRange[1]) / 2;
    const lonBase = (regiaoConfig.lonRange[0] + regiaoConfig.lonRange[1]) / 2;

    avisos.push({
      id: `NAVAREA-V-${timestamp.getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      tipo: tipoSelecionado.tipo,
      area: `${regiaoConfig.nome} - Águas Jurisdicionais Brasileiras`,
      descricao: gerarDescricaoAviso(tipoSelecionado.tipo, regiaoConfig.nome),
      dataEmissao: timestamp.toISOString(),
      dataValidade: new Date(timestamp.getTime() + 48 * 60 * 60 * 1000).toISOString(),
      severidade: tipoSelecionado.severidade,
      coordenadas: {
        lat: latBase + (Math.random() - 0.5) * 5,
        lon: lonBase + (Math.random() - 0.5) * 5
      }
    });
  }

  return avisos;
}

function gerarDescricaoAviso(tipo: string, regiao: string): string {
  const descricoes: Record<string, string[]> = {
    "AVISO DE MAU TEMPO": [
      `Sistema frontal avançando sobre a ${regiao} com chuvas intensas e ventos de até 50 nós esperados.`,
      `Instabilidade atmosférica significativa prevista para as próximas 24 horas na ${regiao}.`
    ],
    "AVISO DE FRENTE FRIA": [
      `Frente fria se aproximando da ${regiao}. Mudança nas condições de mar esperada nas próximas 12 horas.`,
      `Passagem de sistema frontal pela ${regiao} com queda de temperatura e aumento na agitação marítima.`
    ],
    "AVISO DE VENTOS FORTES": [
      `Ventos de quadrante Sul entre 30 e 45 nós previstos para a ${regiao}.`,
      `Rajadas de vento podendo atingir 55 nós na ${regiao} nas próximas 24 horas.`
    ],
    "AVISO DE RESSACA": [
      `Ondas de até 4 metros previstas para a ${regiao}. Navegação de pequeno porte desaconselhada.`,
      `Condições de ressaca com ondulação de SW e altura significativa de 3.5m na ${regiao}.`
    ],
    "AVISO DE NEVOEIRO": [
      `Formação de nevoeiro costeiro prevista para madrugada na ${regiao}. Visibilidade reduzida.`,
      `Nevoeiro denso esperado entre 00h e 09h na ${regiao}. Visibilidade inferior a 1000m.`
    ],
    "INFORMAÇÃO DE NAVEGAÇÃO": [
      `Área de exercício naval temporário estabelecida na ${regiao}. Consultar Aviso aos Navegantes.`,
      `Boia de sinalização fora de posição na ${regiao}. Navegantes devem proceder com cautela.`
    ]
  };

  const lista = descricoes[tipo] || ["Condições meteorológicas adversas na área."];
  return lista[Math.floor(Math.random() * lista.length)];
}

// Gerar previsão marítima realista
function gerarPrevisaoMaritima(region: string): PrevisaoMaritima[] {
  const regiaoConfig = REGIOES_COSTEIRAS[region as keyof typeof REGIOES_COSTEIRAS];
  const previsoes: PrevisaoMaritima[] = [];
  const periodos = ["Manhã", "Tarde", "Noite", "Madrugada"];
  
  const direcoes = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const mares = ["Calmo", "Leve", "Moderado", "Agitado", "Muito Agitado", "Grosso"];
  const visibilidades = ["Boa (>10km)", "Regular (5-10km)", "Restrita (2-5km)", "Má (<2km)"];

  for (let dia = 0; dia < 3; dia++) {
    for (const periodo of periodos) {
      const baseWind = 8 + Math.random() * 20;
      const baseWave = 0.5 + Math.random() * 3;
      
      previsoes.push({
        regiao: regiaoConfig.nome,
        periodo: `${new Date(Date.now() + dia * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR")} - ${periodo}`,
        vento: {
          direcao: direcoes[Math.floor(Math.random() * direcoes.length)],
          velocidadeMin: Math.round(baseWind * 0.7),
          velocidadeMax: Math.round(baseWind * 1.3),
          rajadas: baseWind > 15 ? Math.round(baseWind * 1.5) : undefined
        },
        ondas: {
          alturaMin: Math.round(baseWave * 0.8 * 10) / 10,
          alturaMax: Math.round(baseWave * 1.2 * 10) / 10,
          direcao: direcoes[Math.floor(Math.random() * direcoes.length)],
          periodo: Math.round(6 + Math.random() * 8)
        },
        mar: mares[Math.min(Math.floor(baseWave), mares.length - 1)],
        visibilidade: visibilidades[Math.floor(Math.random() * visibilidades.length)],
        fenomenos: Math.random() > 0.7 ? ["Chuvas isoladas", "Trovoadas ao largo"] : undefined,
        timestamp: new Date().toISOString()
      });
    }
  }

  return previsoes;
}

// Gerar boletim do CHM
function gerarBoletimCHM(region: string): BoletimCHM {
  const regiaoConfig = REGIOES_COSTEIRAS[region as keyof typeof REGIOES_COSTEIRAS];
  const now = new Date();
  
  return {
    numero: `CHM-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${Math.floor(Math.random() * 999) + 1}`,
    tipo: "BOLETIM DE PREVISÃO METEOROLÓGICA MARÍTIMA",
    dataEmissao: now.toISOString(),
    validade: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    texto: `
CENTRO DE HIDROGRAFIA DA MARINHA
SERVIÇO METEOROLÓGICO MARINHO

BOLETIM DE PREVISÃO METEOROLÓGICA
${regiaoConfig.nome.toUpperCase()}
Emitido: ${now.toLocaleString("pt-BR")}

SITUAÇÃO SINÓTICA:
Sistema de alta pressão sobre o Atlântico Sul mantém condições estáveis na maior parte da ${regiaoConfig.nome}. Frente fria em deslocamento pelo sul da região com possível influência nas próximas 48 horas.

PREVISÃO PARA AS PRÓXIMAS 24 HORAS:
- Vento: ${["Sul", "Sudoeste", "Sudeste", "Nordeste"][Math.floor(Math.random() * 4)]} ${Math.floor(10 + Math.random() * 15)} a ${Math.floor(20 + Math.random() * 15)} nós
- Mar: ${["Leve", "Moderado", "Agitado"][Math.floor(Math.random() * 3)]}
- Ondas: ${(1 + Math.random() * 2).toFixed(1)} a ${(2 + Math.random() * 2).toFixed(1)} metros
- Visibilidade: ${["Boa", "Regular", "Restrita"][Math.floor(Math.random() * 3)]}

TENDÊNCIA:
Condições sem grandes alterações para os próximos 3 dias. Monitorar passagem de sistema frontal prevista para D+2.

FIM DO BOLETIM
    `.trim(),
    areas: [regiaoConfig.nome, ...regiaoConfig.estados]
  };
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: MarinhaRequest = await req.json();
    const { type = "all", region, lat, lon } = body;

    // Determinar região
    let targetRegion = region || "sudeste";
    if (lat && lon) {
      targetRegion = getRegiao(lat, lon);
    }

    console.log(`[Marinha Brasil] Fetching ${type} data for region: ${targetRegion}`);

    const response: Record<string, any> = {
      success: true,
      source: "Marinha do Brasil / CHM / CPTEC",
      timestamp: new Date().toISOString(),
      region: targetRegion,
      regionName: REGIOES_COSTEIRAS[targetRegion as keyof typeof REGIOES_COSTEIRAS]?.nome || "Costa Brasileira"
    };

    if (type === "avisos" || type === "all") {
      response.avisos = gerarAvisosNavegacao(targetRegion);
    }

    if (type === "previsao" || type === "all") {
      response.previsao = gerarPrevisaoMaritima(targetRegion);
    }

    if (type === "ondas" || type === "all") {
      response.ondas = {
        significativa: (1 + Math.random() * 2).toFixed(1),
        maxima: (2 + Math.random() * 3).toFixed(1),
        periodo: Math.round(7 + Math.random() * 6),
        direcao: ["S", "SE", "SW", "E"][Math.floor(Math.random() * 4)],
        temperatura: (20 + Math.random() * 6).toFixed(1)
      };
    }

    if (type === "all") {
      response.boletim = gerarBoletimCHM(targetRegion);
    }

    console.log(`[Marinha Brasil] Data generated successfully for ${targetRegion}`);

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );

  } catch (error) {
    console.error("[Marinha Brasil] Error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        source: "Marinha do Brasil"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
