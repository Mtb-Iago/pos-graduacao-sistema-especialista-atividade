export interface ItemCache {
    pergunta: string;
    resposta: string;
    origem?: string;
    similaridade?: number;
}

export abstract class SemanticCachePort {
    abstract buscarSimilar(
        embedding: number[], 
        limiarMinimo: number
    ): Promise<ItemCache | null>;

    abstract salvar(
        pergunta: string, 
        embedding: number[], 
        resposta: string, 
        origem?: string
    ): Promise<void>;
}
