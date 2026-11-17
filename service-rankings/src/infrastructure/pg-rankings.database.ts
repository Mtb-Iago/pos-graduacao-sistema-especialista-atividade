import { Injectable } from '@nestjs/common';
import { RankingsRepository } from '../domain/rankings.repository.js';
import { Pool } from 'pg';

@Injectable()
export class PgRankingsDatabase implements RankingsRepository {
    private pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    async findGeral(): Promise<any[]> {
        const res = await this.pool.query(`
            SELECT 
                id,
                atleta_id,
                atleta_nome,
                categoria_id,
                tempo_prova,
                posicao_categoria,
                ROW_NUMBER() OVER (ORDER BY tempo_prova ASC)::int as posicao_geral,
                status
            FROM rankings 
            WHERE status = 'Finalizou' 
            ORDER BY tempo_prova ASC
        `);
        return res.rows;
    }
    
    async findByCategoria(id: number): Promise<any[]> {
        const res = await this.pool.query(
            "SELECT * FROM rankings WHERE categoria_id = $1 ORDER BY COALESCE(posicao_categoria, 9999) ASC, tempo_prova ASC",
            [id]
        );
        return res.rows;
    }
}
