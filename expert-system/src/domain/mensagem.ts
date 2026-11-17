export interface MensagemChat {
    tipo: 'user' | 'model' | 'system';
    texto: string;
}

export interface RespostaEspecialista {
    texto: string;
    origem: 'cache_semantico' | 'llm_motor' | 'guardrail_bloqueio';
    score_similaridade?: number;
    cache_gravado?: boolean;
    ferramentas_executadas?: string[];
    tokens_consumidos?: {
        entrada: number;
        saida: number;
        total: number;
    };
    latencia_ms: number;
}
