export interface ValidacaoEscopo {
    permitido: boolean;
    motivoRecusa?: string;
    categoriaEscopo?: 'REGRAS' | 'RESULTADOS' | 'AUDITORIA' | 'SAUDACAO' | 'FORA_ESCOPO';
}

export abstract class GuardrailPort {
    abstract validarPergunta(pergunta: string): Promise<ValidacaoEscopo>;
}
