import { Controller, Get, Param, Query } from '@nestjs/common';
import { AtletasService } from '../application/atletas.service.js';

@Controller()
export class AtletasController {
    constructor(private readonly service: AtletasService) {}

    @Get('atletas')
    async getAtletas(@Query('nome') nome?: string) {
        return this.service.getAtletas(nome);
    }

    @Get('atletas/:id')
    async getAtletaById(@Param('id') id: string) {
        return this.service.getAtletaById(Number(id));
    }

    @Get('categorias')
    async getCategorias() {
        return this.service.getCategorias();
    }

    @Get('categorias/:id')
    async getCategoriaById(@Param('id') id: string) {
        return this.service.getCategoriaById(Number(id));
    }
}
