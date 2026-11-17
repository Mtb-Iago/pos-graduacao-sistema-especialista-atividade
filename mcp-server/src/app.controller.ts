import { Controller, Req, Res, Get, Post, Delete } from '@nestjs/common';
import type { Request, Response } from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import axios from 'axios';
import * as crypto from 'crypto';
import { avaliarElegibilidade, CriteriosAtleta } from './domain/regras-elegibilidade.js';

const SERVICES_URL = {
  ATLETAS: process.env.SERVICE_ATLETAS_URL || 'http://service-atletas:3000',
  RESULTADOS: process.env.SERVICE_RESULTADOS_URL || 'http://service-resultados:3000',
  RANKINGS: process.env.SERVICE_RANKINGS_URL || 'http://service-rankings:3000'
} as const;

function createMcpServer(): McpServer {
  const mcp = new McpServer({ 
    name: 'mtbexpert-mcp', 
    version: '1.0.0' 
  });

  // 1. get_atletas
  mcp.registerTool(
    'get_atletas',
    {
      description: 'Busca a lista de atletas cadastrados na competição, com filtro opcional por nome.',
      inputSchema: {
        nome: z.string().optional().describe('Nome ou trecho do nome do atleta para filtrar a busca')
      }
    },
    async (args: any) => {
      try {
        const nome = args?.nome || args?.arguments?.nome || '';
        const url = nome 
          ? `${SERVICES_URL.ATLETAS}/atletas?nome=${encodeURIComponent(nome)}`
          : `${SERVICES_URL.ATLETAS}/atletas`;
        const res = await axios.get(url);
        return { content: [{ type: 'text', text: JSON.stringify(res.data) }] };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { isError: true, content: [{ type: 'text', text: `Erro ao buscar atletas: ${msg}` }] };
      }
    }
  );

  // 2. get_atleta_info
  mcp.registerTool(
    'get_atleta_info',
    {
      description: 'Consulta ficha cadastral completa de um atleta (idade, peso, sexo, categoria, ebike, pcd).',
      inputSchema: {
        id: z.coerce.number().describe('ID numérico do atleta cadastrado')
      }
    },
    async (args: any) => {
      try {
        const id = args?.id ?? args?.arguments?.id;
        const res = await axios.get(`${SERVICES_URL.ATLETAS}/atletas/${id}`);
        if (!res.data) {
          return { isError: true, content: [{ type: 'text', text: `Atleta com ID ${id} não foi encontrado.` }] };
        }
        return { content: [{ type: 'text', text: JSON.stringify(res.data) }] };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { isError: true, content: [{ type: 'text', text: `Erro ao consultar atleta: ${msg}` }] };
      }
    }
  );

  // 3. get_categorias
  mcp.registerTool(
    'get_categorias',
    {
      description: 'Lista todas as categorias oficiais da competição MTB com critérios de enquadramento (faixas etárias, sexo, peso, requisitos).',
      inputSchema: {}
    },
    async () => {
      try {
        const res = await axios.get(`${SERVICES_URL.ATLETAS}/categorias`);
        return { content: [{ type: 'text', text: JSON.stringify(res.data) }] };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { isError: true, content: [{ type: 'text', text: `Erro ao buscar categorias: ${msg}` }] };
      }
    }
  );

  // 4. get_resultados
  mcp.registerTool(
    'get_resultados',
    {
      description: 'Busca a listagem completa dos tempos brutos e status de prova (Finalizou, DNF - Did Not Finish, DNS - Did Not Start).',
      inputSchema: {}
    },
    async () => {
      try {
        const res = await axios.get(`${SERVICES_URL.RESULTADOS}/resultados`);
        return { content: [{ type: 'text', text: JSON.stringify(res.data) }] };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { isError: true, content: [{ type: 'text', text: `Erro ao buscar resultados: ${msg}` }] };
      }
    }
  );

  // 5. get_resultado_atleta
  mcp.registerTool(
    'get_resultado_atleta',
    {
      description: 'Consulta o resultado de prova de um atleta específico por ID (tempo final e status).',
      inputSchema: {
        id: z.coerce.number().describe('ID do atleta')
      }
    },
    async (args: any) => {
      try {
        const id = args?.id ?? args?.arguments?.id;
        const res = await axios.get(`${SERVICES_URL.RESULTADOS}/resultados/${id}`);
        if (!res.data) {
          return { isError: true, content: [{ type: 'text', text: `Resultado para o atleta ID ${id} não encontrado.` }] };
        }
        return { content: [{ type: 'text', text: JSON.stringify(res.data) }] };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { isError: true, content: [{ type: 'text', text: `Erro ao buscar resultado do atleta: ${msg}` }] };
      }
    }
  );

  // 6. get_rankings
  mcp.registerTool(
    'get_rankings',
    {
      description: 'Consulta a classificação geral da prova, ordenada pelo menor tempo entre atletas que concluíram (Finalizou).',
      inputSchema: {
        limite: z.coerce.number().optional().describe('Número máximo de posições a retornar (ex: 5 para top 5)')
      }
    },
    async (args: any) => {
      try {
        const limite = args?.limite ?? args?.arguments?.limite;
        const res = await axios.get(`${SERVICES_URL.RANKINGS}/rankings/geral`);
        let dados = res.data;
        if (limite && Array.isArray(dados)) {
          dados = dados.slice(0, Number(limite));
        }
        return { content: [{ type: 'text', text: JSON.stringify(dados) }] };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { isError: true, content: [{ type: 'text', text: `Erro ao buscar ranking geral: ${msg}` }] };
      }
    }
  );

  // 7. get_ranking_categoria
  mcp.registerTool(
    'get_ranking_categoria',
    {
      description: 'Consulta a classificação oficial dos atletas para uma categoria específica (ordenada por posição e tempo).',
      inputSchema: {
        id: z.coerce.number().describe('ID numérico da categoria (ex: 1 para E-Bike, 2 para Elite Feminino, etc)')
      }
    },
    async (args: any) => {
      try {
        const id = args?.id ?? args?.arguments?.id;
        const res = await axios.get(`${SERVICES_URL.RANKINGS}/rankings/categoria/${id}`);
        return { content: [{ type: 'text', text: JSON.stringify(res.data) }] };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { isError: true, content: [{ type: 'text', text: `Erro ao buscar ranking da categoria: ${msg}` }] };
      }
    }
  );

  // 8. verificar_elegibilidade (Motor de Regras Regulamentares Especialista)
  mcp.registerTool(
    'verificar_elegibilidade',
    {
      description: 'Avalia o enquadramento regulamentar oficial (CBC/UCI) de um atleta a partir de idade, sexo, peso, condição PCD, ebike e nível esportivo, indicando categorias permitidas e motivos de recusa.',
      inputSchema: {
        idade: z.coerce.number().describe('Idade do atleta em anos na temporada 2026'),
        sexo: z.enum(['M', 'F']).describe('Sexo biológico/categoria de gênero (M para masculino, F para feminino)'),
        peso_kg: z.coerce.number().optional().describe('Peso corporal em kg (relevante para categorias de Peso Pesado)'),
        pcd: z.boolean().optional().describe('Se é atleta PCD com laudo comprobatório'),
        ebike: z.boolean().optional().describe('Se a bicicleta utilizada é assistida por motor elétrico'),
        nivel: z.enum(['INICIANTE', 'AMADOR', 'ELITE']).optional().describe('Nível esportivo do atleta')
      }
    },
    async (args: any) => {
      try {
        const criterios: CriteriosAtleta = {
          idade: Number(args?.idade ?? args?.arguments?.idade),
          sexo: (args?.sexo ?? args?.arguments?.sexo) as 'M' | 'F',
          peso_kg: args?.peso_kg ?? args?.arguments?.peso_kg ? Number(args?.peso_kg ?? args?.arguments?.peso_kg) : undefined,
          pcd: Boolean(args?.pcd ?? args?.arguments?.pcd),
          ebike: Boolean(args?.ebike ?? args?.arguments?.ebike),
          nivel: args?.nivel ?? args?.arguments?.nivel
        };

        const resCat = await axios.get(`${SERVICES_URL.ATLETAS}/categorias`);
        const resultado = avaliarElegibilidade(criterios, resCat.data);
        return { content: [{ type: 'text', text: JSON.stringify(resultado) }] };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { isError: true, content: [{ type: 'text', text: `Erro na validação de elegibilidade: ${msg}` }] };
      }
    }
  );

  // 9. auditar_atleta (Comissário Técnico Virtual: auditoria de conformidade de atleta cadastrado)
  mcp.registerTool(
    'auditar_atleta',
    {
      description: 'Audita se um atleta cadastrado na prova está regular na sua categoria inscrita (verifica idade, peso, uso de ebike e laudo PCD) e acusa eventuais irregularidades de inscrição.',
      inputSchema: {
        id: z.coerce.number().describe('ID do atleta a ser auditado pelo Comissário')
      }
    },
    async (args: any) => {
      try {
        const id = args?.id ?? args?.arguments?.id;
        const [atletaRes, catRes] = await Promise.all([
          axios.get(`${SERVICES_URL.ATLETAS}/atletas/${id}`),
          axios.get(`${SERVICES_URL.ATLETAS}/categorias`)
        ]);

        const atleta = atletaRes.data;
        const categorias = catRes.data;
        const categoriaAtual = categorias.find((c: any) => c.id === atleta.categoria_id);

        if (!atleta || !categoriaAtual) {
          return { isError: true, content: [{ type: 'text', text: 'Atleta ou categoria não encontrados.' }] };
        }

        const anoNasc = atleta.data_nascimento ? parseInt(atleta.data_nascimento.split('-')[0]) : 2000;
        const idade = 2026 - anoNasc;

        const criterios: CriteriosAtleta = {
          idade,
          sexo: atleta.sexo as 'M' | 'F',
          peso_kg: atleta.peso_kg,
          pcd: atleta.pcd,
          ebike: atleta.ebike,
          nivel: atleta.nivel
        };

        const avaliacao = avaliarElegibilidade(criterios, categorias);
        const compatibilidadeAtual = avaliacao.categorias_recomendadas.find(c => c.id === atleta.categoria_id);
        const motivoIncompativel = avaliacao.categorias_incompativeis.find(c => c.id === atleta.categoria_id);

        const relatorioAuditoria = {
          atleta_id: atleta.id,
          nome: atleta.nome,
          categoria_inscrita: {
            id: categoriaAtual.id,
            nome: categoriaAtual.nome
          },
          dados_atleta: {
            idade_calculada_2026: idade,
            sexo: atleta.sexo,
            peso_kg: atleta.peso_kg,
            pcd: atleta.pcd,
            ebike: atleta.ebike,
            nivel: atleta.nivel
          },
          status_auditoria: compatibilidadeAtual ? 'REGULAR' : 'IRREGULAR',
          parecer_comissario: compatibilidadeAtual 
            ? 'Atleta plenamente em conformidade com o regulamento oficial na categoria inscrita.'
            : `ATENÇÃO: Irregularidade detectada! Motivo: ${motivoIncompativel?.motivo || 'Critérios não atendidos'}`,
          categorias_alternativas_permitidas: avaliacao.categorias_recomendadas.map(c => c.nome),
          observacoes_regulamentares: avaliacao.observacoes_regulamentares
        };

        return { content: [{ type: 'text', text: JSON.stringify(relatorioAuditoria) }] };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { isError: true, content: [{ type: 'text', text: `Erro na auditoria do atleta: ${msg}` }] };
      }
    }
  );

  return mcp;
}

@Controller('mcp')
export class AppController {
  private sessions: Map<string, { transport: StreamableHTTPServerTransport; mcp: McpServer }> = new Map();

  @Post()
  async handleMessages(@Req() req: Request, @Res() res: Response) {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;

    try {
      if (sessionId && this.sessions.has(sessionId)) {
        const session = this.sessions.get(sessionId)!;
        await session.transport.handleRequest(req, res, req.body);
        return;
      }

      if (!sessionId && isInitializeRequest(req.body)) {
        const mcp = createMcpServer();
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => crypto.randomUUID(),
          onsessioninitialized: (id) => {
            console.log(`Sessão MCP inicializada: ${id}`);
            this.sessions.set(id, { transport, mcp });
          }
        });

        transport.onclose = () => {
          const sid = transport.sessionId;
          if (sid) {
            this.sessions.delete(sid);
            console.log(`Sessão MCP encerrada: ${sid}`);
          }
        };

        await mcp.connect(transport);
        await transport.handleRequest(req, res, req.body);
        return;
      }

      res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Bad Request: No valid session ID provided'
        },
        id: null
      });
    } catch (error) {
      console.error('Erro ao processar POST MCP:', error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: { code: -32603, message: 'Internal server error' },
          id: null
        });
      }
    }
  }

  @Get()
  async establishSseStream(@Req() req: Request, @Res() res: Response) {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;

    if (!sessionId || !this.sessions.has(sessionId)) {
      return res.status(400).send('Invalid or missing session ID');
    }

    const session = this.sessions.get(sessionId)!;
    await session.transport.handleRequest(req, res);
  }

  @Delete()
  async terminateSession(@Req() req: Request, @Res() res: Response) {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;

    if (!sessionId || !this.sessions.has(sessionId)) {
      return res.status(400).send('Invalid or missing session ID');
    }

    const session = this.sessions.get(sessionId)!;
    await session.transport.handleRequest(req, res);
  }
}
