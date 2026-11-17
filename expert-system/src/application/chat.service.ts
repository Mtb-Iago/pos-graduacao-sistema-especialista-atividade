import { Injectable, Logger } from '@nestjs/common';
import { LlmPort } from '../domain/llm.port.js';
import { EmbeddingPort } from '../domain/embedding.port.js';
import { SemanticCachePort } from '../domain/semantic-cache.port.js';
import { McpToolsPort } from '../domain/mcp-tools.port.js';
import { GuardrailPort } from '../domain/guardrail.port.js';
import { PersonaBuilder } from './persona.builder.js';
import { RespostaEspecialista } from '../domain/mensagem.js';

@Injectable()
export class ChatService {
    private readonly logger = new Logger(ChatService.name);

    constructor(
        private readonly llm: LlmPort,
        private readonly embedding: EmbeddingPort,
        private readonly cache: SemanticCachePort,
        private readonly mcp: McpToolsPort,
        private readonly guardrail: GuardrailPort,
        private readonly personaBuilder: PersonaBuilder
    ) {}

    async processarMensagem(
        mensagem: string,
        historico: { role: 'user' | 'model'; text: string }[] = []
    ): Promise<RespostaEspecialista> {
        const inicio = Date.now();
        const perguntaLimpa = mensagem.trim();

        // 1. Guardrail de Domínio (Entrada)
        const validacao = await this.guardrail.validarPergunta(perguntaLimpa);
        if (!validacao.permitido) {
            return {
                texto: validacao.motivoRecusa || 'Pergunta fora do escopo da arbitragem de Mountain Bike.',
                origem: 'guardrail_bloqueio',
                latencia_ms: Date.now() - inicio
            };
        }

        // 2. Cache Semântico
        const vetorPergunta = await this.embedding.gerarEmbedding(perguntaLimpa);
        const limiarCache = parseFloat(process.env.CACHE_THRESHOLD || '0.72');
        const itemCache = await this.cache.buscarSimilar(vetorPergunta, limiarCache);

        if (itemCache) {
            this.logger.log(`Hit no cache semântico (score: ${itemCache.similaridade?.toFixed(3)}) para: "${perguntaLimpa}"`);
            return {
                texto: itemCache.resposta,
                origem: 'cache_semantico',
                score_similaridade: itemCache.similaridade,
                latencia_ms: Date.now() - inicio
            };
        }

        // 3. Orquestração LLM + Tools MCP
        const systemInstruction = await this.personaBuilder.construirInstrucaoSistema();
        const tools = await this.mcp.listarFerramentas();

        const historicoAtual = [...historico, { role: 'user' as const, text: perguntaLimpa }];
        const ferramentasExecutadas: string[] = [];
        let tokensConsumidos = { entrada: 0, saida: 0, total: 0 };

        let resposta = await this.llm.gerarResposta(systemInstruction, historicoAtual, tools);
        this.acumularTokens(tokensConsumidos, resposta.tokens);

        let iteracoes = 5;
        while (resposta.toolCalls && resposta.toolCalls.length > 0 && iteracoes-- > 0) {
            const previousId = resposta.rawInteraction?.id;
            const toolResults: any[] = [];

            for (const call of resposta.toolCalls) {
                this.logger.log(`Executando ferramenta MCP: ${call.name} com args: ${JSON.stringify(call.arguments)}`);
                ferramentasExecutadas.push(call.name);

                const resTool = await this.mcp.executarFerramenta(call);
                toolResults.push(resTool);
            }

            if (!previousId) break;

            resposta = await this.llm.continuarComToolResults(
                systemInstruction,
                historicoAtual,
                previousId,
                toolResults,
                tools
            );
            this.acumularTokens(tokensConsumidos, resposta.tokens);
        }

        const textoFinal = resposta.texto || 'Não foi possível gerar uma resposta para a consulta.';

        // 4. Gravação no Cache Semântico
        // Apenas dúvidas conceituais/regulamentares (sem tools ao vivo e sem mensagens de erro/aviso) são salvas.
        // Perguntas autocontidas são cacheadas mesmo com histórico de conversa ativo.
        const isAvisoOuErro = textoFinal.includes('⚠️ [Aviso do MTBExpert]') || textoFinal.includes('Não foi possível');
        const isPerguntaDependente = /^(e\s|mas\s|ent[aã]o\s|e\s+o\s|e\s+a\s|dele\b|dela\b|disso\b|desse\b|dessa\b)/i.test(perguntaLimpa);
        const isAutocontida = historico.length === 0 || (perguntaLimpa.length >= 15 && !isPerguntaDependente);

        let cacheGravado = false;
        if (ferramentasExecutadas.length === 0 && isAutocontida && textoFinal.length > 30 && !isAvisoOuErro) {
            await this.cache.salvar(perguntaLimpa, vetorPergunta, textoFinal, 'llm_motor');
            cacheGravado = true;
            this.logger.log(`Nova resposta gravada no cache semântico para: "${perguntaLimpa}"`);
        }

        return {
            texto: textoFinal,
            origem: 'llm_motor',
            cache_gravado: cacheGravado || undefined,
            ferramentas_executadas: ferramentasExecutadas.length > 0 ? ferramentasExecutadas : undefined,
            tokens_consumidos: tokensConsumidos,
            latencia_ms: Date.now() - inicio
        };
    }

    private acumularTokens(alvo: any, fonte?: any) {
        if (!fonte) return;
        alvo.entrada += fonte.entrada || 0;
        alvo.saida += fonte.saida || 0;
        alvo.total += fonte.total || 0;
    }
}
