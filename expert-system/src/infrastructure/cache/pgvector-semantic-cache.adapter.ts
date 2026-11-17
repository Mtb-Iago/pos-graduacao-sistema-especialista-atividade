import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SemanticCachePort, ItemCache } from '../../domain/semantic-cache.port.js';
import { EmbeddingPort } from '../../domain/embedding.port.js';
import { KnowledgePort } from '../../domain/knowledge.port.js';
import { Pool } from 'pg';

@Injectable()
export class PgvectorSemanticCacheAdapter implements SemanticCachePort, OnModuleInit {
    private readonly logger = new Logger(PgvectorSemanticCacheAdapter.name);
    private pool: Pool;

    constructor(
        private readonly embedding: EmbeddingPort,
        private readonly knowledge: KnowledgePort
    ) {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL || 'postgresql://mcp:mcp@db-expert:5432/mcp_expert'
        });
    }

    async onModuleInit(): Promise<void> {
        await this.inicializarCacheSemente();
    }

    private async inicializarCacheSemente(): Promise<void> {
        const maxTentativas = 5;
        for (let tentativa = 1; tentativa <= maxTentativas; tentativa++) {
            try {
                const faq = await this.knowledge.obterFaq();
                if (!faq || faq.length === 0) {
                    return;
                }

                const countRes = await this.pool.query(
                    `SELECT COUNT(*)::int AS total FROM cache_semantico WHERE origem = 'faq_semente'`
                );
                const totalSemente = countRes.rows[0]?.total ?? 0;

                if (totalSemente >= faq.length) {
                    this.logger.log(
                        `✅ Cache semântico pgvector já inicializado (${totalSemente} regras canônicas prontas).`
                    );
                    return;
                }

                this.logger.log(
                    `⏳ Semeando cache semântico pgvector com ${faq.length} regras canônicas do regulamento...`
                );
                const inicio = Date.now();

                for (const item of faq) {
                    const vetor = await this.embedding.gerarEmbedding(item.pergunta);
                    await this.salvar(item.pergunta, vetor, item.resposta, 'faq_semente');
                }

                this.logger.log(
                    `✅ Cache semântico pgvector semeado e pronto para uso! (${faq.length} regras indexadas em ${Date.now() - inicio}ms)`
                );
                return;
            } catch (err: any) {
                if (tentativa < maxTentativas) {
                    this.logger.warn(
                        `Aguardando banco vetorial pgvector ficar disponível (tentativa ${tentativa}/${maxTentativas}): ${err.message}`
                    );
                    await new Promise((r) => setTimeout(r, 2000));
                } else {
                    this.logger.warn(
                        `Não foi possível semear o cache semântico na inicialização: ${err.message}`
                    );
                }
            }
        }
    }

    async buscarSimilar(embedding: number[], limiarMinimo: number = 0.88): Promise<ItemCache | null> {
        try {
            const vectorStr = `[${embedding.join(',')}]`;
            const query = `
                SELECT 
                    pergunta, 
                    resposta, 
                    origem,
                    (1 - (embedding <=> $1::vector)) as similaridade
                FROM cache_semantico
                WHERE (1 - (embedding <=> $1::vector)) >= $2
                ORDER BY similaridade DESC
                LIMIT 1
            `;
            const res = await this.pool.query(query, [vectorStr, limiarMinimo]);
            if (res.rows.length === 0) {
                return null;
            }

            const row = res.rows[0];
            await this.pool.query(
                'UPDATE cache_semantico SET hits = hits + 1 WHERE pergunta = $1', 
                [row.pergunta]
            ).catch(() => {});

            return {
                pergunta: row.pergunta,
                resposta: row.resposta,
                origem: row.origem,
                similaridade: parseFloat(row.similaridade)
            };
        } catch (err: any) {
            this.logger.warn(`Erro ao consultar cache semântico pgvector: ${err.message}`);
            return null;
        }
    }

    async salvar(pergunta: string, embedding: number[], resposta: string, origem: string = 'llm'): Promise<void> {
        if (!pergunta?.trim() || !resposta?.trim()) return;

        try {
            const vectorStr = `[${embedding.join(',')}]`;
            const norm = pergunta.toLowerCase().trim().replace(/\s+/g, ' ');
            const query = `
                INSERT INTO cache_semantico (pergunta, pergunta_normalizada, embedding, resposta, origem)
                VALUES ($1, $2, $3::vector, $4, $5)
                ON CONFLICT (pergunta_normalizada) DO UPDATE 
                SET resposta = EXCLUDED.resposta, embedding = EXCLUDED.embedding
            `;
            await this.pool.query(query, [pergunta.trim(), norm, vectorStr, resposta, origem]);
        } catch (err: any) {
            this.logger.warn(`Erro ao salvar no cache semântico pgvector: ${err.message}`);
        }
    }
}
