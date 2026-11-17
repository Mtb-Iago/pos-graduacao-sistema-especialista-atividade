import { Injectable, Logger } from '@nestjs/common';
import { SemanticCachePort, ItemCache } from '../../domain/semantic-cache.port.js';
import { Pool } from 'pg';

@Injectable()
export class PgvectorSemanticCacheAdapter implements SemanticCachePort {
    private readonly logger = new Logger(PgvectorSemanticCacheAdapter.name);
    private pool: Pool;

    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL || 'postgresql://mcp:mcp@db-expert:5432/mcp_expert'
        });
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
