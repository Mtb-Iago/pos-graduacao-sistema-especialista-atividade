import { Injectable, Logger } from '@nestjs/common';
import { LlmPort, ToolDeclaration, ToolCallResult, LLMResponse } from '../../domain/llm.port.js';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class GeminiLlmAdapter implements LlmPort {
    private readonly logger = new Logger(GeminiLlmAdapter.name);
    private ai: GoogleGenAI;
    private readonly modelName = process.env.GEMINI_MODEL || 'gemini-flash-latest';

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
        this.ai = new GoogleGenAI({ apiKey });
    }

    private formatarToolsParaGemini(tools?: ToolDeclaration[]): any[] | undefined {
        if (!tools || tools.length === 0) return undefined;
        return tools.map(t => ({
            type: 'function',
            name: t.name,
            description: t.description,
            parameters: t.parameters
        }));
    }

    async gerarResposta(
        systemInstruction: string,
        historico: { role: 'user' | 'model'; text: string }[],
        tools?: ToolDeclaration[]
    ): Promise<LLMResponse> {
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
        if (!apiKey || apiKey === 'sua_chave_aqui') {
            this.logger.warn('Chave GEMINI_API_KEY ausente ou não configurada.');
            return {
                texto: '⚠️ [Aviso do MTBExpert]: A chave GEMINI_API_KEY não foi configurada no arquivo .env. As respostas que necessitam de raciocínio generativo dinâmico requerem a chave para acessar o modelo Gemini. No entanto, o Cache Semântico vetorial (pgvector) e os Guardrails estão 100% ativos.',
                tokens: { entrada: 0, saida: 0, total: 0 }
            };
        }

        try {
            const input: any[] = [
                {
                    type: 'user_input',
                    content: [{ type: 'text', text: `INSTRUÇÕES DO SISTEMA:\n${systemInstruction}` }]
                }
            ];

            for (const item of historico) {
                input.push({
                    type: item.role === 'user' ? 'user_input' : 'model_output',
                    content: [{ type: 'text', text: item.text }]
                });
            }

            const geminiTools = this.formatarToolsParaGemini(tools);

            const params: any = {
                model: this.modelName,
                input: input
            };
            if (geminiTools) {
                params.tools = geminiTools;
            }

            const interaction = await this.ai.interactions.create(params);
            return this.parseInteraction(interaction);
        } catch (err: any) {
            this.logger.error(`Erro ao invocar Gemini LLM: ${err.message}`);
            return {
                texto: `Não foi possível consultar o modelo de linguagem no momento (${err.message}). Verifique a chave GEMINI_API_KEY e suas cotas.`,
                tokens: { entrada: 0, saida: 0, total: 0 }
            };
        }
    }

    async continuarComToolResults(
        systemInstruction: string,
        historico: { role: 'user' | 'model'; text: string }[],
        previousInteractionId: string,
        toolResults: ToolCallResult[],
        tools?: ToolDeclaration[]
    ): Promise<LLMResponse> {
        try {
            const inputSteps: any[] = toolResults.map(tr => ({
                type: 'function_result',
                name: tr.name,
                call_id: tr.id,
                result: [{ type: 'text', text: tr.result }]
            }));

            const geminiTools = this.formatarToolsParaGemini(tools);

            const params: any = {
                model: this.modelName,
                input: inputSteps,
                previous_interaction_id: previousInteractionId
            };
            if (geminiTools) {
                params.tools = geminiTools;
            }

            const interaction = await this.ai.interactions.create(params);
            return this.parseInteraction(interaction);
        } catch (err: any) {
            this.logger.error(`Erro na continuação com MCP tools: ${err.message}`);
            return {
                texto: `Instabilidade ao processar o retorno das ferramentas MCP: ${err.message}`,
                tokens: { entrada: 0, saida: 0, total: 0 }
            };
        }
    }

    private parseInteraction(interaction: any): LLMResponse {
        const steps = interaction.steps || [];
        const functionCalls: any[] = [];

        for (const s of steps) {
            if (s.type === 'function_call') {
                functionCalls.push({
                    id: s.id,
                    name: s.name,
                    arguments: s.arguments
                });
            }
        }

        const usage = interaction.usage || {};
        return {
            texto: interaction.output_text || '',
            toolCalls: functionCalls.length > 0 ? functionCalls : undefined,
            tokens: {
                entrada: usage.total_input_tokens || 0,
                saida: usage.total_output_tokens || 0,
                total: usage.total_tokens || 0
            },
            rawInteraction: interaction
        };
    }
}
