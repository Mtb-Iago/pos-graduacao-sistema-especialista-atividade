export interface ToolDeclaration {
    name: string;
    description: string;
    parameters: Record<string, any>;
}

export interface ToolCallRequest {
    id: string;
    name: string;
    arguments: Record<string, any>;
}

export interface ToolCallResult {
    id: string;
    name: string;
    result: string;
}

export interface LLMResponse {
    texto: string;
    toolCalls?: ToolCallRequest[];
    tokens?: {
        entrada: number;
        saida: number;
        total: number;
    };
    rawInteraction?: any;
}

export abstract class LlmPort {
    abstract gerarResposta(
        systemInstruction: string,
        historico: { role: 'user' | 'model'; text: string }[],
        tools?: ToolDeclaration[]
    ): Promise<LLMResponse>;

    abstract continuarComToolResults(
        systemInstruction: string,
        historico: { role: 'user' | 'model'; text: string }[],
        previousInteractionId: string,
        toolResults: ToolCallResult[],
        tools?: ToolDeclaration[]
    ): Promise<LLMResponse>;
}
