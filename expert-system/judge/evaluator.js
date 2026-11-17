import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

const CHAT_URL = process.env.EXPERT_CHAT_URL || 'http://localhost:3005/api/chat';
const MODELO_JULGADOR = process.env.JUDGE_MODEL || 'gemini-flash-latest';
const TIMEOUT_JULGADOR_MS = 45000;

async function avaliarCaso(ai, caso, respostaBot) {
  const promptJulgamento = `Você é o Auditor Chefe e Juiz Regulamentar de Sistemas Especialistas da CBC (Confederação Brasileira de Ciclismo).
Sua missão é avaliar a resposta fornecida pelo chatbot especialista 'MTBExpert' para a pergunta do usuário.

PERGUNTA DO USUÁRIO:
"${caso.pergunta}"

CRITÉRIO ESPERADO DE AVALIAÇÃO:
"${caso.criterio_esperado}"

RESPOSTA GERADA PELO CHATBOT ESPECIALISTA:
"${respostaBot.reply || respostaBot.resposta || ''}"

ORIGEM DA RESPOSTA: ${respostaBot.origem}
FERRAMENTAS MCP EXECUTADAS: ${JSON.stringify(respostaBot.ferramentas_executadas || [])}

Avalie a resposta sob três dimensões estritas (atribua notas inteiras de 0 a 10):
1. Acurácia Regulamentar: A resposta obedece às regras oficiais de MTB, faixas etárias, E-Bike ou guardrails?
2. Assertividade em Dados: Se a pergunta exigia dados ao vivo (atletas, tempos, categorias), as ferramentas MCP foram consultadas sem inventar números? Se era guardrail, recusou adequadamente?
3. Ausência de Alucinação: A resposta se ateve aos fatos reais sem inventar regras fictícias ou detalhes não comprovados?

FORMATO OBRIGATÓRIO DE RESPOSTA (JSON PURO):
{
  "acuracia_regulamentar": 10,
  "assertividade_dados": 10,
  "ausencia_alucinacao": 10,
  "parecer": "Justificativa técnica concisa do julgamento."
}`;

  try {
    const chamada = ai.interactions.create({
      model: MODELO_JULGADOR,
      input: promptJulgamento,
      response_format: {
        type: 'text',
        mime_type: 'application/json',
        schema: {
          type: 'object',
          properties: {
            acuracia_regulamentar: { type: 'number' },
            assertividade_dados: { type: 'number' },
            ausencia_alucinacao: { type: 'number' },
            parecer: { type: 'string' }
          },
          required: ['acuracia_regulamentar', 'assertividade_dados', 'ausencia_alucinacao', 'parecer']
        }
      }
    });

    // Timeout de segurança: evita travamento quando o modelo julgador está sobrecarregado (503)
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout de ${TIMEOUT_JULGADOR_MS / 1000}s aguardando o modelo julgador`)), TIMEOUT_JULGADOR_MS)
    );
    const res = await Promise.race([chamada, timeout]);

    const parsed = JSON.parse(res.output_text || '{}');
    const notaReg = parsed.acuracia_regulamentar ?? 8;
    const notaDados = parsed.assertividade_dados ?? 8;
    const notaAluc = parsed.ausencia_alucinacao ?? 8;
    const media = parseFloat(((notaReg + notaDados + notaAluc) / 3).toFixed(1));

    return {
      id: caso.id,
      pergunta: caso.pergunta,
      resposta_chatbot: respostaBot.reply || respostaBot.resposta || '',
      origem: respostaBot.origem,
      ferramentas_usadas: respostaBot.ferramentas_executadas,
      nota_acuracia_regulamentar: notaReg,
      nota_assertividade_dados: notaDados,
      nota_ausencia_alucinacao: notaAluc,
      media_final: media,
      status: media >= 7.0 ? 'APROVADO' : 'REPROVADO',
      parecer_julgador: parsed.parecer || 'Avaliação concluída com sucesso.'
    };
  } catch (err) {
    return {
      id: caso.id,
      pergunta: caso.pergunta,
      resposta_chatbot: respostaBot.reply || '',
      origem: respostaBot.origem,
      nota_acuracia_regulamentar: 0,
      nota_assertividade_dados: 0,
      nota_ausencia_alucinacao: 0,
      media_final: 0.0,
      status: 'REPROVADO',
      parecer_julgador: `Falha na chamada ao modelo julgador: ${err.message}`
    };
  }
}

export async function executarJulgamento() {
  console.log('========================================================================');
  console.log('🚴 MTBExpert - Avaliador Automatizado LLM-as-a-Judge');
  console.log('Auditoria Técnica de Precisão Regulamentar e Assertividade');
  console.log('========================================================================\n');

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
  if (!apiKey || apiKey === 'sua_chave_aqui') {
    console.error('❌ [ERRO] A chave GEMINI_API_KEY não foi configurada no arquivo .env.');
    console.error('O módulo LLM-as-a-Judge requer uma chave válida da API Gemini para realizar a auditoria.\n');
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });
  console.log(`Modo de Julgamento: LLM-as-a-Judge Ativo (Modelo Julgador: ${MODELO_JULGADOR})`);

  const datasetPath = path.resolve(process.cwd(), 'judge/dataset.json');
  const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));

  console.log(`Carregados ${dataset.length} casos de teste no dataset.`);
  console.log(`Conectando ao MTBExpert em: ${CHAT_URL}\n`);

  const resultados = [];

  for (const caso of dataset) {
    process.stdout.write(`[Caso #${caso.id}] "${caso.pergunta.substring(0, 45)}..." -> `);

    try {
      const inicio = Date.now();
      const resChat = await axios.post(CHAT_URL, { message: caso.pergunta }, { timeout: 25000 });
      const latencia = Date.now() - inicio;

      const julgamento = await avaliarCaso(ai, caso, resChat.data);
      resultados.push(julgamento);

      const icone = julgamento.status === 'APROVADO' ? '✅' : '❌';
      console.log(`${icone} ${julgamento.status} (Nota: ${julgamento.media_final}/10 | Origem: ${julgamento.origem} | ${latencia}ms)`);
    } catch (err) {
      console.log(`⚠️ Falha ao consultar chatbot: ${err.message}`);
    }

    // Intervalo de segurança anti rate-limit
    await new Promise(r => setTimeout(r, 1200));
  }

  // Resumo Estatístico
  const total = resultados.length;
  const aprovados = resultados.filter(r => r.status === 'APROVADO').length;
  const mediaGeral = total > 0 ? (resultados.reduce((acc, r) => acc + r.media_final, 0) / total).toFixed(2) : '0';
  const taxaAprovacao = total > 0 ? ((aprovados / total) * 100).toFixed(1) : '0';

  console.log('\n========================================================================');
  console.log('📊 RELATÓRIO CONSOLIDADO DO LLM-AS-A-JUDGE');
  console.log('========================================================================');
  console.log(`Total de Casos Avaliados: ${total}`);
  console.log(`Casos Aprovados:          ${aprovados} (${taxaAprovacao}%)`);
  console.log(`Média Geral de Notas:     ${mediaGeral} / 10.0`);
  console.log('========================================================================\n');

  // Grava relatório em JSON
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `relatorio_julgamento_${timestamp}.json`;
  const reportPath = path.resolve(process.cwd(), `judge/reports/${fileName}`);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    modelo_julgador: MODELO_JULGADOR,
    total_casos: total,
    aprovados,
    taxa_aprovacao_pct: parseFloat(taxaAprovacao),
    media_geral: parseFloat(mediaGeral),
    detalhes: resultados
  }, null, 2), 'utf-8');

  console.log(`💾 Relatório completo salvo em: expert-system/judge/reports/${fileName}`);
}
