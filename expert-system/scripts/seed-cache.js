import { pipeline } from '@huggingface/transformers';
import fs from 'fs';
import path from 'path';
import pg from 'pg';

const { Pool } = pg;

async function seed() {
    console.log('--- Semeador do Cache Semântico Vetorial (MTBExpert) ---');
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL || 'postgresql://mcp:mcp@db-expert:5432/mcp_expert'
    });

    const faqPath = path.resolve(process.cwd(), 'base_conhecimento/faq_regulamento.json');
    const faq = JSON.parse(fs.readFileSync(faqPath, 'utf-8'));
    console.log(`Carregando modelo ONNX Xenova/paraphrase-multilingual-MiniLM-L12-v2...`);
    const extractor = await pipeline('feature-extraction', 'Xenova/paraphrase-multilingual-MiniLM-L12-v2');

    console.log(`Gerando embeddings semânticos para ${faq.length} perguntas regulamentares...`);
    for (const item of faq) {
        const out = await extractor(item.pergunta, { pooling: 'mean', normalize: true });
        const embedding = Array.from(out.data);
        const vectorStr = `[${embedding.join(',')}]`;
        const norm = item.pergunta.toLowerCase().trim().replace(/\s+/g, ' ');

        await pool.query(`
            INSERT INTO cache_semantico (pergunta, pergunta_normalizada, embedding, resposta, origem)
            VALUES ($1, $2, $3::vector, $4, 'faq_semente')
            ON CONFLICT (pergunta_normalizada) DO UPDATE
            SET embedding = EXCLUDED.embedding, resposta = EXCLUDED.resposta;
        `, [item.pergunta, norm, vectorStr, item.resposta]);

        console.log(`✔ Cache semeado: "${item.pergunta.substring(0, 50)}..."`);
    }

    console.log('\nTestando busca semântica aproximada por similaridade de cosseno...');
    const perguntaTeste = 'Qual a velocidade de corte do motor da bike eletrica?';
    const outTeste = await extractor(perguntaTeste, { pooling: 'mean', normalize: true });
    const vecTeste = `[${Array.from(outTeste.data).join(',')}]`;

    const res = await pool.query(`
        SELECT pergunta, resposta, (1 - (embedding <=> $1::vector)) as similaridade
        FROM cache_semantico
        ORDER BY similaridade DESC
        LIMIT 1;
    `, [vecTeste]);

    if (res.rows.length > 0) {
        console.log(`Consulta teste: "${perguntaTeste}"`);
        console.log(`Mais similar encontrada: "${res.rows[0].pergunta}"`);
        console.log(`Similaridade calculada: ${parseFloat(res.rows[0].similaridade).toFixed(4)} (Threshold: 0.82)`);
    }

    await pool.end();
    console.log('\n✅ Cache semântico vetorial 100% atualizado com modelo multilingual!');
}

seed().catch(err => {
    console.error('Falha no seeding do cache:', err);
    process.exit(1);
});
