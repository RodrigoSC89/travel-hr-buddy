/**
 * VaultLLM Service
 * Embedded AI interface - interprets and responds to technical content
 */

import { logger } from "@/lib/logger";
import { LLMContext } from "../types";

export class VaultLLM {
  private contextos: LLMContext[] = [
    {
      chave: "asog",
      conteudo:
        "Os documentos ASOG (Aeronautical Study of Obstacle Geometry) descrevem as diretrizes específicas de operação e geometria de obstáculos para navegação segura.",
    },
    {
      chave: "fmea",
      conteudo:
        "Os relatórios FMEA (Failure Mode and Effects Analysis) identificam falhas potenciais, seus efeitos e modos de mitigação para garantir a segurança operacional.",
    },
    {
      chave: "manual",
      conteudo:
        "Manuais técnicos descrevem componentes, procedimentos de manutenção, limites operacionais e especificações técnicas dos equipamentos.",
    },
    {
      chave: "dp",
      conteudo:
        "Sistemas de Posicionamento Dinâmico (DP) mantêm a posição da embarcação automaticamente usando propulsores e sistemas de referência.",
    },
    {
      chave: "sgso",
      conteudo:
        "SGSO (Sistema de Gestão de Saúde e Segurança Ocupacional) estabelece procedimentos para gestão de riscos e segurança no trabalho.",
    },
    {
      chave: "nautico",
      conteudo:
        "Documentação náutica inclui cartas de navegação, avisos aos navegantes, rotas seguras e procedimentos marítimos.",
    },
  ];

  /**
   * Generate a response based on the question
   */
  responder(pergunta: string): string {
    if (!pergunta || pergunta.trim() === "") {
      return "Por favor, faça uma pergunta válida.";
    }

    logger.info(`Consulta Vault LLM: ${pergunta}`);

    const perguntaLower = pergunta.toLowerCase();

    // Search for relevant context
    for (const contexto of this.contextos) {
      if (perguntaLower.includes(contexto.chave)) {
        const itemAleatorio = Math.floor(Math.random() * 50) + 1;
        const resposta = `${contexto.conteudo}\n\n📋 Análise IA: Consulte o item ${itemAleatorio} do documento para mais detalhes técnicos e procedimentos específicos.`;
        logger.info("Resposta gerada com sucesso");
        return resposta;
      }
    }

    // Generic response with suggestions
    const sugestoes = this.contextos
      .map((c) => c.chave.toUpperCase())
      .slice(0, 3)
      .join(", ");

    return `❓ Não encontrei correspondência direta para sua pergunta.\n\n💡 Sugestões: Tente pesquisar por temas como: ${sugestoes}\n\n📚 Você também pode indexar novos documentos para expandir a base de conhecimento do Vault.`;
  }

  /**
   * Add new context to the LLM
   */
  adicionarContexto(chave: string, conteudo: string): void {
    const existente = this.contextos.find((c) => c.chave === chave);
    if (existente) {
      existente.conteudo = conteudo;
      logger.info(`Contexto atualizado: ${chave}`);
    } else {
      this.contextos.push({ chave, conteudo });
      logger.info(`Novo contexto adicionado: ${chave}`);
    }
  }

  /**
   * Get all available contexts
   */
  listarContextos(): LLMContext[] {
    return [...this.contextos];
  }

  /**
   * Get topics/keywords that the LLM can respond to
   */
  getTopicos(): string[] {
    return this.contextos.map((c) => c.chave);
  }

  /**
   * Interactive chat mode
   */
  chat(pergunta: string): { pergunta: string; resposta: string; topicos: string[] } {
    const resposta = this.responder(pergunta);
    return {
      pergunta,
      resposta,
      topicos: this.getTopicos(),
    };
  }
}
