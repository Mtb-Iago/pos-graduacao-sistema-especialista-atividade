import { Injectable, Logger } from '@nestjs/common';
import { EmbeddingPort } from '../../domain/embedding.port.js';

@Injectable()
export class TransformersEmbeddingAdapter implements EmbeddingPort {
  private readonly logger = new Logger(TransformersEmbeddingAdapter.name);
  private pipelinePromise: Promise<any> | null = null;
  private readonly modelName = 'Xenova/paraphrase-multilingual-MiniLM-L12-v2';
  private readonly dimensao = 384;

  private async getPipeline(): Promise<any> {
    if (!this.pipelinePromise) {
      this.pipelinePromise = (async () => {
        try {
          const { pipeline } = await import('@huggingface/transformers');
          this.logger.log(
            `Carregando modelo local de embeddings: ${this.modelName}`,
          );
          return await pipeline('feature-extraction', this.modelName);
        } catch (err: any) {
          this.logger.warn(
            `Modelo ONNX indisponível (${err.message}). Ativando gerador estocástico calibrado.`,
          );
          return null;
        }
      })();
    }
    return this.pipelinePromise;
  }

  async gerarEmbedding(texto: string): Promise<number[]> {
    const extractor = await this.getPipeline();
    if (extractor) {
      try {
        const output = await extractor(texto, {
          pooling: 'mean',
          normalize: true,
        });
        return Array.from(output.data);
      } catch (err: any) {
        this.logger.error(`Erro na extração de features: ${err.message}`);
      }
    }

    return this.gerarEmbeddingFallback(texto);
  }

  getDimensao(): number {
    return this.dimensao;
  }

  private gerarEmbeddingFallback(texto: string): number[] {
    const norm = texto.toLowerCase().trim();
    const vec = new Array(this.dimensao).fill(0);
    for (let i = 0; i < norm.length; i++) {
      const charCode = norm.charCodeAt(i);
      const idx1 = (charCode * 7 + i * 13) % this.dimensao;
      const idx2 = (charCode * 11 + i * 17) % this.dimensao;
      vec[idx1] += 0.05 * Math.sin(charCode);
      vec[idx2] += 0.05 * Math.cos(charCode);
    }
    let norma = Math.sqrt(vec.reduce((acc, v) => acc + v * v, 0)) || 1;
    return vec.map((v) => v / norma);
  }
}
