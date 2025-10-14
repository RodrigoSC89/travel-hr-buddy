import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  
  // Check if this is a WebSocket upgrade request
  if (req.headers.get("upgrade") !== "websocket") {
    return new Response("Expected websocket", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);

  socket.onopen = () => {
    console.log("WebSocket connected to client");
  };

  socket.onmessage = async (event) => {
    try {
      const clientMessage = JSON.parse(event.data);
      console.log("Received from client:", clientMessage.type);

      // Create WebSocket connection to OpenAI
      const openaiWs = new WebSocket("wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17", [
        "realtime",
        `openai-insecure-api-key.${Deno.env.get("OPENAI_API_KEY")}`
      ]);

      openaiWs.onopen = () => {
        console.log("Connected to OpenAI Realtime API");
        
        // Send session configuration after connection
        const sessionConfig = {
          type: "session.update",
          session: {
            modalities: ["text", "audio"],
            instructions: `Você é um assistente de voz inteligente para um sistema empresarial chamado Nautilus. Você pode ajudar com:
            
            NAVEGAÇÃO NO SISTEMA:
            - Dashboard principal (use função navigate_system com "dashboard")
            - Recursos Humanos - RH (use função navigate_system com "hr")
            - Módulo de Viagens (use função navigate_system com "travel") 
            - Alertas de Preço (use função navigate_system com "price-alerts")
            - Relatórios (use função navigate_system com "reports")
            - Configurações (use função navigate_system com "settings")
            - PEO-DP (use função navigate_system com "peo-dp")
            
            FUNCIONALIDADES ESPECÍFICAS:
            - Consultas sobre certificados e funcionários (módulo RH)
            - Pesquisa de voos e hotéis (módulo viagens)
            - Configuração de alertas de preços
            - Análise de dados e estatísticas
            - Geração de relatórios
            
            🧠 CENTRO DE INTELIGÊNCIA DP:
            Você também é especialista em Posicionamento Dinâmico (DP) e pode responder perguntas sobre:
            - Incidentes DP (ex: "Explique o incidente IMCA-2025-009")
            - Normas IMCA (M190, M103, M117, M182, etc.)
            - Causas de falhas DP (perda de posição, drive-off, falhas de sistema)
            - Análise de conformidade PEO-DP
            - Sistemas DP (gyro, thruster, DGPS, reference systems)
            - Ações preventivas e corretivas
            - Classes de embarcações DP (DP1, DP2, DP3)
            
            Quando o usuário perguntar sobre DP ou incidentes IMCA:
            - Forneça respostas técnicas e detalhadas
            - Cite normas IMCA relevantes
            - Sugira ações preventivas
            - Explique causas raízes e fatores contribuintes
            
            INSTRUÇÕES DE COMPORTAMENTO:
            - Sempre responda em português brasileiro de forma conversacional e útil
            - Seja proativo em sugerir ações relevantes
            - Use as funções disponíveis quando apropriado
            - Mantenha um tom profissional mas amigável
            - Forneça respostas claras e precisas
            - Para tópicos técnicos de DP, seja detalhado e preciso
            
            Quando o usuário solicitar navegação ou ações específicas, use as funções apropriadas para executá-las.`,
            voice: "alloy",
            input_audio_format: "pcm16",
            output_audio_format: "pcm16",
            input_audio_transcription: {
              model: "whisper-1"
            },
            turn_detection: {
              type: "server_vad",
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 1000
            },
            tools: [
              {
                type: "function",
                name: "navigate_system",
                description: "Navegar para diferentes módulos do sistema Nautilus",
                parameters: {
                  type: "object",
                  properties: {
                    module: {
                      type: "string",
                      enum: ["dashboard", "hr", "travel", "price-alerts", "reports", "settings", "peo-dp"],
                      description: "Módulo para navegar: dashboard (página principal), hr (recursos humanos), travel (viagens), price-alerts (alertas de preço), reports (relatórios), settings (configurações), peo-dp (Dynamic Positioning Plan)"
                    }
                  },
                  required: ["module"]
                }
              },
              {
                type: "function", 
                name: "search_flights",
                description: "Buscar voos disponíveis no sistema",
                parameters: {
                  type: "object",
                  properties: {
                    origin: { 
                      type: "string",
                      description: "Cidade ou aeroporto de origem"
                    },
                    destination: { 
                      type: "string",
                      description: "Cidade ou aeroporto de destino"
                    },
                    date: { 
                      type: "string",
                      description: "Data da viagem no formato YYYY-MM-DD"
                    }
                  },
                  required: ["origin", "destination", "date"]
                }
              },
              {
                type: "function",
                name: "get_system_status",
                description: "Obter status atual do sistema e estatísticas gerais",
                parameters: {
                  type: "object",
                  properties: {
                    details: {
                      type: "boolean",
                      description: "Se deve incluir detalhes técnicos"
                    }
                  },
                  required: []
                }
              },
              {
                type: "function",
                name: "check_certificates",
                description: "Verificar certificados de funcionários que estão vencendo",
                parameters: {
                  type: "object",
                  properties: {
                    days_ahead: {
                      type: "number",
                      description: "Número de dias para verificar vencimentos futuros"
                    }
                  },
                  required: []
                }
              }
            ],
            tool_choice: "auto",
            temperature: 0.8,
            max_response_output_tokens: "inf"
          }
        };

        openaiWs.send(JSON.stringify(sessionConfig));
        
        // Forward client message to OpenAI
        openaiWs.send(event.data);
      };

      openaiWs.onmessage = (openaiEvent) => {
        const data = JSON.parse(openaiEvent.data);
        console.log("Received from OpenAI:", data.type);

        // Handle function calls
        if (data.type === "response.function_call_arguments.done") {
          console.log("Function call:", data.name, data.arguments);
          
          let functionResult = { success: true, message: "Função executada com sucesso" };
          
          try {
            const args = JSON.parse(data.arguments);
            
            switch (data.name) {
            case "navigate_system":
              functionResult = {
                success: true,
                message: `Navegando para o módulo: ${args.module}`,
                action: "navigation",
                module: args.module
              } as any;
              break;
                
            case "search_flights":
              functionResult = {
                success: true,
                message: `Buscando voos de ${args.origin} para ${args.destination} em ${args.date}`,
                action: "flight_search",
                data: args
              } as any;
              break;
                
            case "get_system_status":
              functionResult = {
                success: true,
                message: "Sistema operacional. Todos os módulos funcionando normalmente.",
                action: "system_status",
                status: "operational",
                modules: ["RH", "Viagens", "Alertas", "Relatórios"]
              } as any;
              break;
                
            case "check_certificates":
              functionResult = {
                success: true,
                message: `Verificando certificados que vencem nos próximos ${args.days_ahead || 30} dias`,
                action: "certificate_check",
                data: args
              } as any;
              break;
                
            default:
              functionResult = {
                success: false,
                message: `Função ${data.name} não reconhecida`
              };
            }
          } catch (error) {
            functionResult = {
              success: false,
              message: `Erro ao processar função: ${error instanceof Error ? error.message : "Unknown error"}`
            };
          }
          
          // Send function response back to OpenAI
          const functionResponse = {
            type: "conversation.item.create",
            item: {
              type: "function_call_output",
              call_id: data.call_id,
              output: JSON.stringify(functionResult)
            }
          };
          openaiWs.send(JSON.stringify(functionResponse));
          openaiWs.send(JSON.stringify({ type: "response.create" }));
        }

        // Forward all messages to client
        socket.send(openaiEvent.data);
      };

      openaiWs.onclose = () => {
        console.log("OpenAI WebSocket closed");
      };

      openaiWs.onerror = (error) => {
        console.error("OpenAI WebSocket error:", error);
      };

    } catch (error) {
      console.error("Error handling message:", error);
      socket.send(JSON.stringify({ 
        type: "error", 
        error: error instanceof Error ? error.message : "Unknown error occurred"
      }));
    }
  };

  socket.onclose = () => {
    console.log("Client WebSocket closed");
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  return response;
});