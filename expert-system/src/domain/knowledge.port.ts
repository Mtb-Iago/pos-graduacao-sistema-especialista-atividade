export interface FaqItem {
    pergunta: string;
    resposta: string;
}

export abstract class KnowledgePort {
    abstract obterRegulamento(): Promise<string>;
    abstract obterFaq(): Promise<FaqItem[]>;
}
