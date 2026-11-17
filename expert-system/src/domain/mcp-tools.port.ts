import { ToolDeclaration, ToolCallRequest, ToolCallResult } from './llm.port.js';

export abstract class McpToolsPort {
    abstract listarFerramentas(): Promise<ToolDeclaration[]>;
    abstract executarFerramenta(toolCall: ToolCallRequest): Promise<ToolCallResult>;
}
