import { Injectable } from '@nestjs/common';
import { KnowledgePort, FaqItem } from '../../domain/knowledge.port.js';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileKnowledgeAdapter implements KnowledgePort {
    private regulamentoCache: string | null = null;
    private faqCache: FaqItem[] | null = null;

    async obterRegulamento(): Promise<string> {
        if (!this.regulamentoCache) {
            const filePath = path.resolve(process.cwd(), 'base_conhecimento/regulamento_mtb.md');
            if (fs.existsSync(filePath)) {
                this.regulamentoCache = fs.readFileSync(filePath, 'utf-8');
            } else {
                this.regulamentoCache = 'Regulamento oficial MTB não encontrado.';
            }
        }
        return this.regulamentoCache;
    }

    async obterFaq(): Promise<FaqItem[]> {
        if (!this.faqCache) {
            const filePath = path.resolve(process.cwd(), 'base_conhecimento/faq_regulamento.json');
            if (fs.existsSync(filePath)) {
                const raw = fs.readFileSync(filePath, 'utf-8');
                this.faqCache = JSON.parse(raw);
            } else {
                this.faqCache = [];
            }
        }
        return this.faqCache!;
    }
}
