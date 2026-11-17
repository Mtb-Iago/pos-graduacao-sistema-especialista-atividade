import { Injectable } from '@nestjs/common';
import { GuardrailPort, ValidacaoEscopo } from '../../domain/guardrail.port.js';

@Injectable()
export class DomainGuardrailAdapter implements GuardrailPort {
    private readonly palavrasChaveMTB = [
        'mtb', 'bike', 'bicicleta', 'mountain', 'prova', 'campeonato', 'etapa', 
        'atleta', 'categoria', 'ranking', 'tempo', 'resultado', 'classificacao', 
        'podio', 'largada', 'chegada', 'percurso', 'circuito', 'comissario', 'arbitragem', 
        'regulamento', 'regra', 'penalidade', 'desclassificacao', 'desempate', 'foto-finish', 
        'dnf', 'dns', 'dsq', 'e-bike', 'ebike', 'eletrica', 'pedelec', 'pne', 'pcd', 
        'peso pesado', 'junior', 'sub 30', 'master', 'elite', 'sport', 'dupla mista', 
        'cicloturismo', 'idade', 'peso', 'pontos', 'cronometragem'
    ];

    private readonly termosSaudacao = [
        'ola', 'olá', 'bom dia', 'boa tarde', 'boa noite', 'oi', 'hey', 'hello', 
        'quem e voce', 'quem é você', 'o que voce faz', 'o que você faz', 'ajuda', 'socorro'
    ];

    private readonly temasProibidos = [
        'receita', 'bolo', 'futebol', 'politica', 'governo', 'presidente', 
        'criptomoeda', 'bitcoin', 'acoes', 'programacao', 'python', 'java', 'sql', 
        'filme', 'novela', 'signo', 'horoscopo', 'tempo em paris', 'clima', 'tempo em'
    ];

    async validarPergunta(pergunta: string): Promise<ValidacaoEscopo> {
        const pNorm = pergunta.toLowerCase().trim();
        const palavrasTexto = pNorm.split(/[^a-z0-9áéíóúâêîôûãõç]+/i).filter(Boolean);

        // 1. Saudações e apresentações puras são acolhidas
        const ehSaudacaoPura = this.termosSaudacao.some(s => 
            pNorm === s || pNorm === s + '!' || pNorm === s + '?' || (palavrasTexto.length <= 3 && pNorm.includes(s))
        );
        if (ehSaudacaoPura) {
            return { permitido: true, categoriaEscopo: 'SAUDACAO' };
        }

        // 2. Filtro de temas explicitamente proibidos
        for (const tema of this.temasProibidos) {
            if (palavrasTexto.includes(tema) || (tema.includes(' ') && pNorm.includes(tema))) {
                return {
                    permitido: false,
                    categoriaEscopo: 'FORA_ESCOPO',
                    motivoRecusa: 'Como Comissário Técnico Virtual de Mountain Bike, meu escopo é restrito exclusivamente ao regulamento oficial, arbitragem, enquadramento de categorias e consulta de dados da competição atual.'
                };
            }
        }

        // 3. Verificação de pertinência ao domínio MTB
        const contemPalavraChave = this.palavrasChaveMTB.some(k => pNorm.includes(k));
        const contemNomeOuId = /(atleta|id|numero|cat|categoria)\s*\d+/i.test(pNorm);

        if (contemPalavraChave || contemNomeOuId) {
            return { permitido: true, categoriaEscopo: 'REGRAS' };
        }

        // 4. Se não tem relação com o domínio da prova, bloqueia imediatamente (<5ms)
        return {
            permitido: false,
            categoriaEscopo: 'FORA_ESCOPO',
            motivoRecusa: 'Não posso responder a esta pergunta. Atuo exclusivamente como Comissário Técnico Virtual e Diretor de Prova de Mountain Bike (MTB). Por favor, pergunte sobre o regulamento, enquadramento de categorias, resultados ou rankings da prova.'
        };
    }
}
