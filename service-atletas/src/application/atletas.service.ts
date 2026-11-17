import { Injectable } from '@nestjs/common';
import { AtletasRepository } from '../domain/atletas.repository.js';

@Injectable()
export class AtletasService {
    constructor(private readonly repo: AtletasRepository) {}

    async getAtletas(nome?: string) {
        if (nome && nome.trim().length > 0) {
            return this.repo.searchByNome(nome.trim());
        }
        return this.repo.findAll();
    }

    async getAtletaById(id: number) {
        return this.repo.findById(id);
    }

    async getCategorias() {
        return this.repo.findCategorias();
    }

    async getCategoriaById(id: number) {
        return this.repo.findCategoriaById(id);
    }
}
