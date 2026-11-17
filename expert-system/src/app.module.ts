import { Module } from '@nestjs/common';
import { ChatController } from './interface/chat.controller.js';
import { ChatService } from './application/chat.service.js';
import { PersonaBuilder } from './application/persona.builder.js';

import { LlmPort } from './domain/llm.port.js';
import { GeminiLlmAdapter } from './infrastructure/llm/gemini-llm.adapter.js';

import { EmbeddingPort } from './domain/embedding.port.js';
import { TransformersEmbeddingAdapter } from './infrastructure/embedding/transformers-embedding.adapter.js';

import { SemanticCachePort } from './domain/semantic-cache.port.js';
import { PgvectorSemanticCacheAdapter } from './infrastructure/cache/pgvector-semantic-cache.adapter.js';

import { McpToolsPort } from './domain/mcp-tools.port.js';
import { McpClientAdapter } from './infrastructure/mcp/mcp-client.adapter.js';

import { KnowledgePort } from './domain/knowledge.port.js';
import { FileKnowledgeAdapter } from './infrastructure/knowledge/file-knowledge.adapter.js';

import { GuardrailPort } from './domain/guardrail.port.js';
import { DomainGuardrailAdapter } from './infrastructure/guardrail/domain-guardrail.adapter.js';

@Module({
    controllers: [ChatController],
    providers: [
        PersonaBuilder,
        ChatService,
        { provide: LlmPort, useClass: GeminiLlmAdapter },
        { provide: EmbeddingPort, useClass: TransformersEmbeddingAdapter },
        { provide: SemanticCachePort, useClass: PgvectorSemanticCacheAdapter },
        { provide: McpToolsPort, useClass: McpClientAdapter },
        { provide: KnowledgePort, useClass: FileKnowledgeAdapter },
        { provide: GuardrailPort, useClass: DomainGuardrailAdapter }
    ]
})
export class AppModule {}
