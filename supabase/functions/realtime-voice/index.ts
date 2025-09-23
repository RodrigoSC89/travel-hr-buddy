import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
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
        `openai-insecure-api-key.${Deno.env.get('OPENAI_API_KEY')}`
      ]);

      openaiWs.onopen = () => {
        console.log("Connected to OpenAI Realtime API");
        
        // Send session configuration after connection
        const sessionConfig = {
          type: "session.update",
          session: {
            modalities: ["text", "audio"],
            instructions: `Você é um assistente de voz inteligente para um sistema empresarial. Você pode ajudar com:
            - Navegação no sistema (RH, Viagens, Alertas de Preço, Relatórios)
            - Consultas sobre certificados e funcionários
            - Pesquisa de voos e hotéis
            - Configuração de alertas de preços
            - Análise de dados e estatísticas
            
            Sempre responda em português brasileiro de forma conversacional e útil.`,
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
                description: "Navegar para diferentes módulos do sistema",
                parameters: {
                  type: "object",
                  properties: {
                    module: {
                      type: "string",
                      enum: ["dashboard", "hr", "travel", "price-alerts", "reports", "settings"]
                    }
                  },
                  required: ["module"]
                }
              },
              {
                type: "function", 
                name: "search_flights",
                description: "Buscar voos disponíveis",
                parameters: {
                  type: "object",
                  properties: {
                    origin: { type: "string" },
                    destination: { type: "string" },
                    date: { type: "string" }
                  },
                  required: ["origin", "destination", "date"]
                }
              },
              {
                type: "function",
                name: "get_system_status",
                description: "Obter status atual do sistema e estatísticas",
                parameters: {
                  type: "object",
                  properties: {},
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
          
          // Send function response back to OpenAI
          const functionResponse = {
            type: "conversation.item.create",
            item: {
              type: "function_call_output",
              call_id: data.call_id,
              output: JSON.stringify({ success: true, message: `Executando ${data.name}` })
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
        error: error.message 
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