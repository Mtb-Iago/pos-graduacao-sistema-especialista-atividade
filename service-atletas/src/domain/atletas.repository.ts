import { Atleta, Categoria } from './atleta.js';

export abstract class AtletasRepository {
    abstract findAll(): Promise<Atleta[]>;
    abstract findById(id: number): Promise<Atleta | null>;
    abstract searchByNome(nome: string): Promise<Atleta[]>;
    abstract findCategorias(): Promise<Categoria[]>;
    abstract findCategoriaById(id: number): Promise<Categoria | null>;
}
