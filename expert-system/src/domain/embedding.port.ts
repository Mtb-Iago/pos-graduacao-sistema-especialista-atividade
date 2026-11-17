export abstract class EmbeddingPort {
    abstract gerarEmbedding(texto: string): Promise<number[]>;
    abstract getDimensao(): number;
}
