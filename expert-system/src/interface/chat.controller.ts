import { Controller, Post, Body } from '@nestjs/common';
import { ChatService } from '../application/chat.service.js';

@Controller('api')
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Post('chat')
    async chat(@Body() body: any) {
        const mensagem = body?.message || body?.pergunta || '';
        const historico = body?.history || [];

        if (!mensagem || typeof mensagem !== 'string') {
            return {
                reply: 'Por favor, informe uma pergunta ou dúvida sobre o campeonato.',
                origem: 'guardrail_bloqueio'
            };
        }

        const resposta = await this.chatService.processarMensagem(mensagem, historico);

        return {
            reply: resposta.texto,
            resposta: resposta.texto,
            origem: resposta.origem,
            cache_gravado: resposta.cache_gravado,
            score_similaridade: resposta.score_similaridade,
            ferramentas_executadas: resposta.ferramentas_executadas,
            tokens_consumidos: resposta.tokens_consumidos,
            latencia_ms: resposta.latencia_ms
        };
    }
}
