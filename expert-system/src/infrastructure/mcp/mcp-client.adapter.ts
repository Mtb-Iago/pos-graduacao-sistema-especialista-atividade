import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { McpToolsPort } from '../../domain/mcp-tools.port.js';
import { ToolDeclaration, ToolCallRequest, ToolCallResult } from '../../domain/llm.port.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

@Injectable()
export class McpClientAdapter extends McpToolsPort implements OnModuleInit {
    private readonly logger = new Logger(McpClientAdapter.name);
    private client: Client | null = null;
    private conectado = false;
    private toolsCache: ToolDeclaration[] = [];
    private readonly mcpUrl = process.env.MCP_SERVER_URL || 'http://mcp-server:8000/mcp';

    async onModuleInit() {
        this.conectar().catch(err => {
            this.logger.warn(`Inicialização diferida do MCP: ${err.message}`);
        });
    }

    private async conectar(): Promise<boolean> {
        if (this.conectado && this.client) return true;

        try {
            this.logger.log(`Conectando ao servidor MCP em ${this.mcpUrl}`);
            const transport = new StreamableHTTPClientTransport(new URL(this.mcpUrl));
            this.client = new Client({ name: 'expert-system-client', version: '1.0.0' }, { capabilities: {} });
            await this.client.connect(transport);
            this.conectado = true;

            const res = await this.client.listTools();
            this.toolsCache = (res.tools || []).map(t => ({
                name: t.name,
                description: t.description || '',
                parameters: t.inputSchema || { type: 'object', properties: {} }
            }));

            this.logger.log(`Conectado ao MCP. Ferramentas descobertas: ${this.toolsCache.map(t => t.name).join(', ')}`);
            return true;
        } catch (err: any) {
            this.logger.warn(`Servidor MCP indisponível em ${this.mcpUrl}: ${err.message}`);
            this.conectado = false;
            return false;
        }
    }

    async listarFerramentas(): Promise<ToolDeclaration[]> {
        if (!this.conectado) {
            await this.conectar();
        }
        return this.toolsCache;
    }

    async executarFerramenta(toolCall: ToolCallRequest): Promise<ToolCallResult> {
        if (!this.conectado || !this.client) {
            const reconnected = await this.conectar();
            if (!reconnected || !this.client) {
                return {
                    id: toolCall.id,
                    name: toolCall.name,
                    result: `[SISTEMA]: O serviço MCP responsável por '${toolCall.name}' está indisponível.`
                };
            }
        }

        try {
            const res = await this.client.callTool({
                name: toolCall.name,
                arguments: toolCall.arguments || {}
            });

            const contentArray = Array.isArray((res as any)?.content) ? (res as any).content : [];
            const textParts = contentArray
                .map((c: any) => c.text || JSON.stringify(c))
                .join('\n');

            return {
                id: toolCall.id,
                name: toolCall.name,
                result: textParts || JSON.stringify(res)
            };
        } catch (err: any) {
            this.logger.error(`Erro ao executar ferramenta ${toolCall.name}: ${err.message}`);
            return {
                id: toolCall.id,
                name: toolCall.name,
                result: `[SISTEMA]: Falha na execução da ferramenta '${toolCall.name}': ${err.message}`
            };
        }
    }
}
