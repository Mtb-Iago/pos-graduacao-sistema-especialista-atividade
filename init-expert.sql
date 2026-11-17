-- =====================================================================
-- MTBExpert - Banco de Dados de Cache Semântico Vetorial (pgvector)
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS cache_semantico (
    id SERIAL PRIMARY KEY,
    pergunta TEXT NOT NULL,
    pergunta_normalizada TEXT NOT NULL UNIQUE,
    embedding vector(384) NOT NULL,
    resposta TEXT NOT NULL,
    origem VARCHAR(50) DEFAULT 'llm_motor',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    hits INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_cache_embedding_hnsw 
ON cache_semantico USING hnsw (embedding vector_cosine_ops);
