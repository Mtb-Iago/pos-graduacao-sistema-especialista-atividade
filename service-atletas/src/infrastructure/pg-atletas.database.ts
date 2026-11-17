import { Injectable } from '@nestjs/common';
import { AtletasRepository } from '../domain/atletas.repository.js';
import { Atleta, Categoria } from '../domain/atleta.js';
import { Pool } from 'pg';

@Injectable()
export class PgAtletasDatabase implements AtletasRepository {
    private pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    async findAll(): Promise<Atleta[]> {
        const query = `
            SELECT 
                a.id, 
                a.nome, 
                a.categoria_id, 
                c.nome as categoria,
                TO_CHAR(a.data_nascimento, 'YYYY-MM-DD') as data_nascimento,
                a.sexo,
                a.peso_kg::FLOAT as peso_kg,
                a.pcd,
                a.ebike,
                a.nivel,
                a.tipo_inscricao
            FROM atletas a 
            JOIN categorias c ON a.categoria_id = c.id
            ORDER BY a.id ASC
        `;
        const res = await this.pool.query(query);
        return res.rows;
    }

    async findById(id: number): Promise<Atleta | null> {
        const query = `
            SELECT 
                a.id, 
                a.nome, 
                a.categoria_id, 
                c.nome as categoria,
                TO_CHAR(a.data_nascimento, 'YYYY-MM-DD') as data_nascimento,
                a.sexo,
                a.peso_kg::FLOAT as peso_kg,
                a.pcd,
                a.ebike,
                a.nivel,
                a.tipo_inscricao
            FROM atletas a 
            JOIN categorias c ON a.categoria_id = c.id
            WHERE a.id = $1
        `;
        const res = await this.pool.query(query, [id]);
        return res.rows[0] || null;
    }

    async searchByNome(nome: string): Promise<Atleta[]> {
        const query = `
            SELECT 
                a.id, 
                a.nome, 
                a.categoria_id, 
                c.nome as categoria,
                TO_CHAR(a.data_nascimento, 'YYYY-MM-DD') as data_nascimento,
                a.sexo,
                a.peso_kg::FLOAT as peso_kg,
                a.pcd,
                a.ebike,
                a.nivel,
                a.tipo_inscricao
            FROM atletas a 
            JOIN categorias c ON a.categoria_id = c.id
            WHERE a.nome ILIKE $1
            ORDER BY a.id ASC
        `;
        const res = await this.pool.query(query, [`%${nome}%`]);
        return res.rows;
    }
    
    async findCategorias(): Promise<Categoria[]> {
        const res = await this.pool.query('SELECT * FROM categorias ORDER BY id ASC');
        return res.rows;
    }

    async findCategoriaById(id: number): Promise<Categoria | null> {
        const res = await this.pool.query('SELECT * FROM categorias WHERE id = $1', [id]);
        return res.rows[0] || null;
    }
}
